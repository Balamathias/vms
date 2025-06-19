from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.db.models import Count
from .models import Student, Election, Position, Candidate, Vote


@admin.register(Student)
class StudentAdmin(UserAdmin):
    list_display = ('matric_number', 'full_name', 'level', 'status', 'state_of_origin', 'email', 'is_active')
    list_filter = ('level', 'status', 'state_of_origin', 'is_active', 'date_joined')
    search_fields = ('matric_number', 'full_name', 'email', 'phone_number')
    ordering = ('matric_number',)
    list_per_page = 50
    
    fieldsets = (
        (None, {'fields': ('matric_number', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email', 'phone_number', 'picture')}),
        ('Academic info', {'fields': ('level', 'state_of_origin', 'status')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('matric_number', 'full_name', 'level', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login', 'id')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


@admin.register(Election)
class ElectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'is_active', 'positions_count', 'votes_count')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('name',)
    ordering = ('-start_date',)
    readonly_fields = ('id',)
    
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
    list_display = ('name', 'election', 'candidates_count', 'votes_count')
    list_filter = ('election', 'election__is_active')
    search_fields = ('name', 'election__name')
    ordering = ('election__start_date', 'name')
    readonly_fields = ('id',)
    
    def candidates_count(self, obj):
        return obj.candidates.count()
    candidates_count.short_description = 'Candidates'
    
    def votes_count(self, obj):
        return obj.vote_set.count()
    votes_count.short_description = 'Votes'
    
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
        ('Campaign Info', {'fields': ('bio', 'photo', 'photo_preview')}),
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
        return obj.vote_set.count()
    votes_received.short_description = 'Votes'
    
    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="max-height: 50px; max-width: 50px; object-fit: cover;" />', obj.photo.url)
        return "No photo"
    photo_preview.short_description = 'Photo Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'position', 'position__election'
        ).prefetch_related('vote_set')


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('voter_matric', 'voter_name', 'candidate_name', 'position', 'election', 'voted_at')
    list_filter = ('position__election', 'position', 'voted_at', 'voter__level')
    search_fields = ('voter__matric_number', 'voter__full_name', 'candidate__student__full_name')
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
    
    def candidate_name(self, obj):
        return obj.candidate.student.full_name
    candidate_name.short_description = 'Candidate'
    candidate_name.admin_order_field = 'candidate__student__full_name'
    
    def election(self, obj):
        return obj.position.election.name
    election.short_description = 'Election'
    election.admin_order_field = 'position__election__name'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'voter', 'candidate', 'candidate__student', 'position', 'position__election'
        )
    
    def has_add_permission(self, request):
        return False  # Prevent manual vote creation
    
    def has_change_permission(self, request, obj=None):
        return False  # Prevent vote modification


# Custom admin site configuration
admin.site.site_header = "Voting Management System"
admin.site.site_title = "VMS Admin"
admin.site.index_title = "Welcome to VMS Administration"
