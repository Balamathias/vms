from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from voting.models import Student, LoginAttempt, IPRestriction, VoteAttempt
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Monitor and report security issues in the voting system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--auto-block',
            action='store_true',
            help='Automatically block suspicious IPs',
        )
        parser.add_argument(
            '--report-only',
            action='store_true',
            help='Only report issues without taking action',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting security monitoring...'))
        
        # Check for multiple account logins from same IP
        self.check_multiple_accounts_per_ip(options['auto_block'])
        
        # Check for suspicious login patterns
        self.check_suspicious_login_patterns()
        
        # Check for vote manipulation patterns
        self.check_vote_manipulation()
        
        # Clean up old security logs
        self.cleanup_old_logs()
        
        self.stdout.write(self.style.SUCCESS('Security monitoring completed.'))

    def check_multiple_accounts_per_ip(self, auto_block=False):
        """Check for multiple accounts logging in from same IP."""
        self.stdout.write('Checking for multiple accounts per IP...')
        
        # Check last 24 hours
        yesterday = timezone.now() - timedelta(days=1)
        
        # Group successful logins by IP
        suspicious_ips = LoginAttempt.objects.filter(
            success=True,
            timestamp__gte=yesterday
        ).values('ip_address').annotate(
            unique_users=Count('matric_number', distinct=True)
        ).filter(unique_users__gt=3)
        
        for ip_data in suspicious_ips:
            ip_address = ip_data['ip_address']
            user_count = ip_data['unique_users']
            
            self.stdout.write(
                self.style.WARNING(
                    f'Suspicious IP: {ip_address} - {user_count} different users'
                )
            )
            
            if auto_block:
                ip_restriction, created = IPRestriction.objects.get_or_create(
                    ip_address=ip_address,
                    defaults={
                        'reason': f'Auto-blocked: {user_count} different users in 24h',
                        'is_blocked': True
                    }
                )
                
                if created:
                    self.stdout.write(
                        self.style.ERROR(f'Blocked IP: {ip_address}')
                    )
                    logger.warning(f'Auto-blocked IP {ip_address} - {user_count} users')

    def check_suspicious_login_patterns(self):
        """Check for suspicious login patterns."""
        self.stdout.write('Checking for suspicious login patterns...')
        
        # Check for brute force attempts
        one_hour_ago = timezone.now() - timedelta(hours=1)
        
        brute_force_ips = LoginAttempt.objects.filter(
            success=False,
            timestamp__gte=one_hour_ago
        ).values('ip_address').annotate(
            failed_attempts=Count('id')
        ).filter(failed_attempts__gt=10)
        
        for ip_data in brute_force_ips:
            ip_address = ip_data['ip_address']
            attempts = ip_data['failed_attempts']
            
            self.stdout.write(
                self.style.ERROR(
                    f'Brute force detected: {ip_address} - {attempts} failed attempts'
                )
            )
            
            # Check if this IP should be blocked
            existing_restriction = IPRestriction.objects.filter(
                ip_address=ip_address
            ).first()
            
            if not existing_restriction:
                IPRestriction.objects.create(
                    ip_address=ip_address,
                    reason=f'Brute force: {attempts} failed attempts',
                    is_blocked=True
                )
                logger.warning(f'Blocked brute force IP {ip_address}')

    def check_vote_manipulation(self):
        """Check for vote manipulation patterns."""
        self.stdout.write('Checking for vote manipulation...')
        
        # Check for rapid voting
        fifteen_minutes_ago = timezone.now() - timedelta(minutes=15)
        
        rapid_voters = VoteAttempt.objects.filter(
            success=True,
            timestamp__gte=fifteen_minutes_ago
        ).values('voter').annotate(
            vote_count=Count('id')
        ).filter(vote_count__gt=5)
        
        for voter_data in rapid_voters:
            if voter_data['voter']:
                try:
                    voter = Student.objects.get(id=voter_data['voter'])
                    vote_count = voter_data['vote_count']
                    
                    self.stdout.write(
                        self.style.WARNING(
                            f'Rapid voting: {voter.matric_number} - {vote_count} votes in 15min'
                        )
                    )
                    logger.warning(f'Rapid voting detected: {voter.matric_number}')
                except Student.DoesNotExist:
                    continue

    def cleanup_old_logs(self):
        """Clean up old security logs to prevent database bloat."""
        self.stdout.write('Cleaning up old security logs...')
        
        # Keep logs for 30 days
        cutoff_date = timezone.now() - timedelta(days=30)
        
        # Clean up old login attempts
        old_login_attempts = LoginAttempt.objects.filter(timestamp__lt=cutoff_date)
        login_count = old_login_attempts.count()
        old_login_attempts.delete()
        
        # Clean up old vote attempts
        old_vote_attempts = VoteAttempt.objects.filter(timestamp__lt=cutoff_date)
        vote_count = old_vote_attempts.count()
        old_vote_attempts.delete()
        
        if login_count > 0 or vote_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Cleaned up {login_count} login attempts and {vote_count} vote attempts'
                )
            )
