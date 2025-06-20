from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.db.models import Count
from .models import Student, Election, Position, Candidate, Vote


@admin.register(Student)
class StudentAdmin(UserAdmin):
    list_display = ('matric_number', 'full_name', 'level', 'status', 'state_of_origin', 'email', 'is_active', 'is_candidate_indicator', 'picture_preview')
    list_filter = ('level', 'status', 'state_of_origin', 'is_active', 'date_joined')
    search_fields = ('matric_number', 'full_name', 'email', 'phone_number')
    ordering = ('matric_number',)
    list_per_page = 50
    
    fieldsets = (
        (None, {'fields': ('matric_number', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email', 'phone_number', 'picture', 'picture_preview')}),
        ('Academic info', {'fields': ('level', 'state_of_origin', 'status')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('matric_number', 'full_name', 'level', 'state_of_origin', 'password1', 'password2'),
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
    list_display = ('name', 'election', 'enhancements_count', 'votes_count', 'eligible_candidates_count')
    list_filter = ('election', 'election__is_active')
    search_fields = ('name', 'election__name')
    ordering = ('election__start_date', 'name')
    readonly_fields = ('id',)
    
    def enhancements_count(self, obj):
        return obj.enhancements.count()
    enhancements_count.short_description = 'Enhancements'
    
    def votes_count(self, obj):
        return obj.votes.count()
    votes_count.short_description = 'Votes'
    
    def eligible_candidates_count(self, obj):
        return Student.objects.filter(level=500, status='active').count()
    eligible_candidates_count.short_description = 'Eligible Students'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('election').prefetch_related('enhancements')


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


admin.site.site_header = "Voting Management System"
admin.site.site_title = "VMS Admin"
admin.site.index_title = "Welcome to VMS Administration"
