from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from .models import Student, Election, Position, Candidate, Vote, IPRestriction, LoginAttempt, VoteAttempt


@admin.register(Student)
class StudentAdmin(UserAdmin):
    list_display = ('matric_number', 'full_name', 'level', 'gender', 'status', 'state_of_origin', 'email', 'is_active', 'is_candidate_indicator', 'picture_preview')
    list_filter = ('level', 'gender', 'status', 'state_of_origin', 'is_active', 'date_joined')
    search_fields = ('matric_number', 'full_name', 'email', 'phone_number')
    ordering = ('matric_number',)
    list_per_page = 50
    
    fieldsets = (
        (None, {'fields': ('matric_number', 'password')}),
        ('Personal info', {'fields': ('full_name', 'gender', 'email', 'phone_number', 'picture', 'picture_preview')}),
        ('Academic info', {'fields': ('level', 'state_of_origin', 'status', 'is_verified', 'is_nominated')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('matric_number', 'full_name', 'gender', 'level', 'state_of_origin', 'password1', 'password2', 'is_verified', 'is_nominated'),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login', 'id', 'picture_preview')
    
    def is_candidate_indicator(self, obj):
        if obj.is_candidate:
            return format_html('<span style="color: green;">✓ Eligible</span>')
        return format_html('<span style="color: gray;">✗ Not Eligible</span>')
    is_candidate_indicator.short_description = 'Candidate Status'
    
    def picture_preview(self, obj):
        if obj.picture:
            return format_html('<img src="{}" style="height: 50px; width: 50px; object-fit: cover; border-radius: 50%;" />', obj.picture.url)
        return "No picture"
    picture_preview.short_description = 'Picture Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


@admin.register(Election)
class ElectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'is_active', 'is_ongoing_indicator', 'positions_count', 'votes_count')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('name',)
    ordering = ('-start_date',)
    readonly_fields = ('id',)
    
    def is_ongoing_indicator(self, obj):
        if obj.is_ongoing:
            return format_html('<span style="color: green;">🔴 Live</span>')
        return format_html('<span style="color: gray;">⚫ Not Active</span>')
    is_ongoing_indicator.short_description = 'Status'
    
    def positions_count(self, obj):
        return obj.positions.count()
    positions_count.short_description = 'Positions'
    
    def votes_count(self, obj):
        return Vote.objects.filter(position__election=obj).count()
    votes_count.short_description = 'Total Votes'
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('positions')


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('name', 'election', 'gender_restriction', 'enhancements_count', 'votes_count', 'eligible_candidates_count', 'position_type')
    list_filter = ('election', 'election__is_active', 'gender_restriction', 'position_type')
    search_fields = ('name', 'election__name')
    ordering = ('election__start_date', 'name')
    readonly_fields = ('id',)
    
    fieldsets = (
        (None, {'fields': ('name', 'election')}),
        ('Restrictions', {'fields': ('gender_restriction', 'position_type')}),
    )
    
    def enhancements_count(self, obj):
        return obj.candidates.count()
    enhancements_count.short_description = 'Candidates'
    def votes_count(self, obj):
        return obj.votes.count()
    votes_count.short_description = 'Votes'
    
    def eligible_candidates_count(self, obj):
        return obj.get_eligible_candidates().count()
    eligible_candidates_count.short_description = 'Eligible Students'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('election').prefetch_related('candidates')

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('student_name', 'matric_number', 'position', 'election', 'votes_received', 'photo_preview')
    list_filter = ('position__election', 'position', 'student__level')
    search_fields = ('student__full_name', 'student__matric_number', 'position__name')
    ordering = ('position__election__start_date', 'position__name', 'student__full_name')
    readonly_fields = ('id', 'photo_preview')
    
    fieldsets = (
        (None, {'fields': ('student', 'position')}),
        ('Enhancement Info', {'fields': ('bio', 'photo', 'photo_preview')}),
    )
    
    def student_name(self, obj):
        return obj.student.full_name
    student_name.short_description = 'Student Name'
    student_name.admin_order_field = 'student__full_name'
    
    def matric_number(self, obj):
        return obj.student.matric_number
    matric_number.short_description = 'Matric Number'
    matric_number.admin_order_field = 'student__matric_number'
    
    def election(self, obj):
        return obj.position.election.name
    election.short_description = 'Election'
    election.admin_order_field = 'position__election__name'
    
    def votes_received(self, obj):
        return Vote.objects.filter(student_voted_for=obj.student, position=obj.position).count()
    votes_received.short_description = 'Votes'
    
    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="max-height: 50px; max-width: 50px; object-fit: cover;" />', obj.photo.url)
        return "No photo"
    photo_preview.short_description = 'Photo Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'position', 'position__election'
        )


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('voter_matric', 'voter_name', 'student_voted_for_name', 'student_voted_for_matric', 'position', 'election', 'voted_at')
    list_filter = ('position__election', 'position', 'voted_at', 'voter__level')
    search_fields = ('voter__matric_number', 'voter__full_name', 'student_voted_for__full_name', 'student_voted_for__matric_number')
    ordering = ('-voted_at',)
    readonly_fields = ('id', 'voted_at')
    date_hierarchy = 'voted_at'
    
    def voter_matric(self, obj):
        return obj.voter.matric_number
    voter_matric.short_description = 'Voter Matric'
    voter_matric.admin_order_field = 'voter__matric_number'
    
    def voter_name(self, obj):
        return obj.voter.full_name
    voter_name.short_description = 'Voter Name'
    voter_name.admin_order_field = 'voter__full_name'
    
    def student_voted_for_name(self, obj):
        return obj.student_voted_for.full_name
    student_voted_for_name.short_description = 'Voted For'
    student_voted_for_name.admin_order_field = 'student_voted_for__full_name'
    
    def student_voted_for_matric(self, obj):
        return obj.student_voted_for.matric_number
    student_voted_for_matric.short_description = 'Candidate Matric'
    student_voted_for_matric.admin_order_field = 'student_voted_for__matric_number'
    
    def election(self, obj):
        return obj.position.election.name
    election.short_description = 'Election'
    election.admin_order_field = 'position__election__name'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'voter', 'student_voted_for', 'position', 'position__election'
        )
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(IPRestriction)
class IPRestrictionAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'is_blocked', 'max_accounts_per_ip', 'reason_preview', 'created_at')
    list_filter = ('is_blocked', 'created_at')
    search_fields = ('ip_address', 'reason')
    actions = ['block_ips', 'unblock_ips']
    readonly_fields = ('created_at', 'updated_at')
    
    def reason_preview(self, obj):
        if obj.reason:
            return obj.reason[:50] + '...' if len(obj.reason) > 50 else obj.reason
        return '-'
    reason_preview.short_description = 'Reason'
    
    def block_ips(self, request, queryset):
        updated = queryset.update(is_blocked=True)
        self.message_user(request, f"{updated} IP addresses blocked.")
    block_ips.short_description = "Block selected IP addresses"
    
    def unblock_ips(self, request, queryset):
        updated = queryset.update(is_blocked=False)
        self.message_user(request, f"{updated} IP addresses unblocked.")
    unblock_ips.short_description = "Unblock selected IP addresses"


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'matric_number', 'success', 'timestamp', 'user_agent_preview')
    list_filter = ('success', 'timestamp')
    search_fields = ('ip_address', 'matric_number')
    readonly_fields = ('ip_address', 'user_agent', 'matric_number', 'success', 'timestamp')
    date_hierarchy = 'timestamp'
    
    def user_agent_preview(self, obj):
        if obj.user_agent:
            return obj.user_agent[:30] + '...' if len(obj.user_agent) > 30 else obj.user_agent
        return '-'
    user_agent_preview.short_description = 'User Agent'
    
    def get_queryset(self, request):
        return super().get_queryset(request).order_by('-timestamp')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(VoteAttempt)
class VoteAttemptAdmin(admin.ModelAdmin):
    list_display = ('voter_info', 'ip_address', 'position_info', 'success', 'timestamp', 'reason_preview')
    list_filter = ('success', 'timestamp', 'position__election')
    search_fields = ('voter__matric_number', 'ip_address', 'position__name')
    readonly_fields = ('voter', 'ip_address', 'position', 'success', 'reason', 'timestamp', 'user_agent')
    date_hierarchy = 'timestamp'
    
    def voter_info(self, obj):
        if obj.voter:
            return f"{obj.voter.full_name} ({obj.voter.matric_number})"
        return "Anonymous"
    voter_info.short_description = 'Voter'
    
    def position_info(self, obj):
        return f"{obj.position.name} - {obj.position.election.name}"
    position_info.short_description = 'Position & Election'
    
    def reason_preview(self, obj):
        if obj.reason:
            return obj.reason[:40] + '...' if len(obj.reason) > 40 else obj.reason
        return '-'
    reason_preview.short_description = 'Reason'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'voter', 'position', 'position__election'
        ).order_by('-timestamp')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


# Security Dashboard View (Custom Admin View)
class SecurityDashboard:
    """Custom admin view for security monitoring."""
    
    @staticmethod
    def get_security_stats():
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_week = now - timedelta(days=7)
        
        return {
            'failed_logins_24h': LoginAttempt.objects.filter(
                success=False, timestamp__gte=last_24h
            ).count(),
            'blocked_ips': IPRestriction.objects.filter(is_blocked=True).count(),
            'failed_votes_24h': VoteAttempt.objects.filter(
                success=False, timestamp__gte=last_24h
            ).count(),
            'multiple_ip_users': Student.objects.filter(
                last_login__gte=last_week
            ).values('last_login_ip').annotate(
                user_count=Count('id')
            ).filter(user_count__gt=3).count(),
        }

admin.site.site_header = "Voting Management System"
admin.site.site_title = "VMS Admin"
admin.site.index_title = "Welcome to VMS Administration"
