"""
Security Configuration for Voting Management System
This file contains security settings and constants used throughout the application.
"""

# Rate Limiting Configuration
RATE_LIMITS = {
    'default': {
        'requests_per_hour': 100,
        'window_size': 3600,  # 1 hour in seconds
    },
    'authentication': {
        'requests_per_hour': 20,
        'window_size': 3600,
    },
    'voting': {
        'requests_per_minute': 5,
        'window_size': 60,
    },
    'api_sensitive': {
        'requests_per_hour': 50,
        'window_size': 3600,
    }
}

# IP Security Configuration
IP_SECURITY = {
    'max_accounts_per_ip': 3,
    'max_failed_logins': 10,
    'failed_login_window': 3600,  # 1 hour
    'brute_force_threshold': 15,
    'auto_block_brute_force': True,
    'same_network_tolerance': True,  # Allow same /24 network
}

# Voting Security Configuration
VOTING_SECURITY = {
    'min_vote_interval': 10,  # Minimum seconds between votes
    'max_votes_per_minute': 2,
    'max_rapid_votes': 3,
    'rapid_vote_window': 60,  # 1 minute
    'ip_change_detection': True,
    'session_ip_tracking': True,
    'voting_hours': range(6, 22),  # 6 AM to 10 PM
    'weekend_voting': True,
}

# Account Security Configuration
ACCOUNT_SECURITY = {
    'max_failed_attempts': 5,
    'lockout_duration': 3600,  # 1 hour
    'password_reset_required_after_lockout': False,
    'track_login_ip': True,
    'suspicious_ip_change_threshold': 30,  # minutes
}

# Monitoring Configuration
MONITORING = {
    'log_all_attempts': True,
    'log_successful_votes': True,
    'log_ip_changes': True,
    'alert_on_suspicious_activity': True,
    'cleanup_logs_after_days': 30,
    'security_report_frequency': 'daily',
}

# Cache Configuration for Security
SECURITY_CACHE = {
    'rate_limit_cache_timeout': 3600,
    'vote_timing_cache_timeout': 300,
    'session_ip_cache_timeout': 1800,
    'blocked_ip_cache_timeout': 86400,  # 24 hours
}

# Security Headers
SECURITY_HEADERS = {
    'X_FRAME_OPTIONS': 'DENY',
    'X_CONTENT_TYPE_OPTIONS': 'nosniff',
    'X_XSS_PROTECTION': '1; mode=block',
    'SECURE_BROWSER_XSS_FILTER': True,
    'SECURE_CONTENT_TYPE_NOSNIFF': True,
    'REFERRER_POLICY': 'strict-origin-when-cross-origin',
}

# Whitelisted IPs (for admin access during emergencies)
WHITELISTED_IPS = [
    # Add emergency admin IPs here
    # '192.168.1.100',
    # '10.0.0.50',
]

# Blacklisted User Agents (known bots/scrapers)
BLACKLISTED_USER_AGENTS = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python-requests',
]

# Security Alerts Configuration
ALERTS = {
    'email_alerts': False,  # Set to True in production
    'admin_emails': [],  # Add admin emails for security alerts
    'alert_threshold': {
        'failed_logins_per_hour': 50,
        'blocked_ips_per_day': 10,
        'rapid_voting_incidents': 5,
    }
}

# Audit Trail Configuration
AUDIT = {
    'log_admin_actions': True,
    'log_vote_details': True,
    'log_user_sessions': True,
    'retain_audit_logs_days': 365,  # 1 year
    'encrypt_sensitive_logs': False,  # Set to True in production
}
