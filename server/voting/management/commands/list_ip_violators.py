from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Count

from voting.models import LoginAttempt, VoteAttempt, Student

class Command(BaseCommand):
    help = "List IPs with multiple distinct successful login accounts in the last N hours (default 72)."

    def add_arguments(self, parser):
        parser.add_argument('--hours', type=int, default=72, help='Lookback window in hours')

    def handle(self, *args, **options):
        hours = options['hours']
        window_start = timezone.now() - timezone.timedelta(hours=hours)
        # Detect IPs where more than one distinct account actually cast votes in the window
        qs = (
            VoteAttempt.objects
            .filter(success=True, timestamp__gte=window_start)
            .exclude(voter__isnull=True)
            .values('ip_address')
            .annotate(distinct_voters=Count('voter', distinct=True))
            .filter(distinct_voters__gt=1)
            .order_by('-distinct_voters')
        )
        if not qs:
            self.stdout.write(self.style.SUCCESS('No violators found.'))
            return
        for row in qs:
            ip = row['ip_address']
            # Earliest successful vote on this IP within window
            earliest = (
                VoteAttempt.objects
                .filter(success=True, timestamp__gte=window_start, ip_address=ip)
                .exclude(voter__isnull=True)
                .order_by('timestamp')
                .first()
            )
            if not earliest:
                self.stdout.write(f"IP {ip} -> accounts: {row['distinct_voters']} | initiator: —")
                continue
            initiator = earliest.voter
            student = Student.objects.filter(id=initiator.id).values('full_name', 'matric_number').first() if initiator else None
            if student:
                self.stdout.write(f"IP {ip} -> accounts: {row['distinct_voters']} | initiator: {student['full_name']} ({student['matric_number']})")
            else:
                self.stdout.write(f"IP {ip} -> accounts: {row['distinct_voters']} | initiator: —")
