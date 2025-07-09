import json
from django.http import JsonResponse
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
from datetime import timedelta
import logging
from .models import IPRestriction, LoginAttempt

logger = logging.getLogger(__name__)


class SecurityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip_address = self.get_client_ip(request)
        
        if self.is_ip_blocked(ip_address):
            logger.warning(f"Blocked IP {ip_address} attempted to access {request.path}")
            return JsonResponse({
                'error': 'Access denied from this IP address',
                'status': 'blocked'
            }, status=403)
        
        if self.is_rate_limited(ip_address, request):
            logger.warning(f"Rate limit exceeded for IP {ip_address}")
            return JsonResponse({
                'error': 'Too many requests. Please try again later.',
                'status': 'rate_limited'
            }, status=429)
        
        response = self.get_response(request)
        return response

    def get_client_ip(self, request):
        """Extract the real client IP address from request headers."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def is_ip_blocked(self, ip_address):
        """Check if the IP address is explicitly blocked."""
        try:
            ip_restriction = IPRestriction.objects.get(ip_address=ip_address)
            return ip_restriction.is_blocked
        except IPRestriction.DoesNotExist:
            return False

    def is_rate_limited(self, ip_address, request):
        """Implement rate limiting to prevent abuse."""
        skip_paths = ['/static/', '/media/', '/admin/jsi18n/']
        if any(request.path.startswith(path) for path in skip_paths):
            return False
            
        cache_key = f"rate_limit_{ip_address}"
        requests = cache.get(cache_key, [])
        now = timezone.now()
        
        requests = [req_time for req_time in requests if now - req_time < timedelta(hours=1)]
        
        # Check if rate limit exceeded (100 requests per hour for regular endpoints)
        max_requests = 100
        
        # Stricter limits for authentication endpoints
        if '/api/v1/auth/' in request.path:
            max_requests = 20
            
        if len(requests) >= max_requests:
            return True
            
        # Add current request
        requests.append(now)
        cache.set(cache_key, requests, 3600)  # Cache for 1 hour
        
        return False


class VotingSecurityMiddleware:
    """Additional security middleware specifically for voting operations."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if '/api/v1/votes/' in request.path and request.method == 'POST':
            if not self.validate_voting_request(request):
                return JsonResponse({
                    'error': 'Invalid voting request detected',
                    'status': 'security_violation'
                }, status=400)
        
        response = self.get_response(request)
        return response

    def validate_voting_request(self, request):
        """Validate voting requests for suspicious patterns."""
        if not request.user.is_authenticated:
            return True  # Let authentication middleware handle this
            
        ip_address = self.get_client_ip(request)
        user_id = request.user.id
        
        cache_key = f"vote_timing_{user_id}"
        last_vote_time = cache.get(cache_key)
        
        if last_vote_time:
            time_diff = timezone.now() - last_vote_time
            if time_diff < timedelta(seconds=5):
                logger.warning(f"Rapid voting detected for user {request.user.matric_number}")
                return False
        
        cache.set(cache_key, timezone.now(), 300)  # Cache for 5 minutes
        
        # Check for IP hopping during voting session
        session_ip_key = f"voting_session_ip_{user_id}"
        stored_ip = cache.get(session_ip_key)
        
        if stored_ip and stored_ip != ip_address:
            # Allow some flexibility for mobile networks, but log suspicious activity
            if not self.is_same_network(stored_ip, ip_address):
                logger.warning(f"IP change during voting session for user {request.user.matric_number}: {stored_ip} -> {ip_address}")
                # Don't block, but log for investigation
        
        cache.set(session_ip_key, ip_address, 1800)  # 30 minutes
        
        return True

    def get_client_ip(self, request):
        """Extract the real client IP address from request headers."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def is_same_network(self, ip1, ip2):
        """Check if two IPs are in the same /24 network (basic check)."""
        try:
            return '.'.join(ip1.split('.')[:3]) == '.'.join(ip2.split('.')[:3])
        except:
            return False