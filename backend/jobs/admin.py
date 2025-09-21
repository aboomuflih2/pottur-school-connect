from django.contrib import admin
from django.utils.html import format_html
from .models import JobCategory, JobPosition, JobApplication, JobApplicationDocument, JobInterview

@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    """
    Job Category admin interface
    """
    list_display = ('name', 'color_display', 'positions_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    ordering = ('name',)
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 2px 8px; border-radius: 3px; color: white;">{}</span>',
            obj.color,
            obj.color
        )
    color_display.short_description = 'Color'
    
    def positions_count(self, obj):
        return obj.positions.count()
    positions_count.short_description = 'Positions Count'

@admin.register(JobPosition)
class JobPositionAdmin(admin.ModelAdmin):
    """
    Job Position admin interface
    """
    list_display = ('title', 'department', 'employment_type', 'status', 'is_featured', 'applications_count', 'views_count')
    list_filter = ('employment_type', 'experience_level', 'status', 'is_featured', 'department', 'created_at')
    search_fields = ('title', 'description', 'department', 'location')
    ordering = ('-created_at',)
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'category', 'department')
        }),
        ('Job Details', {
            'fields': ('requirements', 'responsibilities', 'benefits', 'employment_type', 'experience_level')
        }),
        ('Location & Remote', {
            'fields': ('location', 'is_remote_allowed')
        }),
        ('Salary Information', {
            'fields': ('salary_min', 'salary_max', 'salary_currency', 'is_salary_negotiable')
        }),
        ('Dates', {
            'fields': ('application_deadline', 'start_date')
        }),
        ('Status & Features', {
            'fields': ('status', 'is_featured', 'posted_by')
        }),
        ('Statistics', {
            'fields': ('views_count', 'applications_count')
        }),
    )
    
    readonly_fields = ('views_count', 'applications_count')
    
    actions = ['publish_positions', 'close_positions', 'feature_positions']
    
    def publish_positions(self, request, queryset):
        queryset.update(status='published')
        self.message_user(request, f'{queryset.count()} positions published.')
    publish_positions.short_description = 'Publish selected positions'
    
    def close_positions(self, request, queryset):
        queryset.update(status='closed')
        self.message_user(request, f'{queryset.count()} positions closed.')
    close_positions.short_description = 'Close selected positions'
    
    def feature_positions(self, request, queryset):
        queryset.update(is_featured=True)
        self.message_user(request, f'{queryset.count()} positions featured.')
    feature_positions.short_description = 'Feature selected positions'

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    """
    Job Application admin interface
    """
    list_display = ('application_number', 'full_name', 'position', 'status', 'submitted_at')
    list_filter = ('status', 'position__department', 'position__employment_type', 'submitted_at', 'created_at')
    search_fields = ('application_number', 'first_name', 'last_name', 'email', 'position__title')
    ordering = ('-submitted_at', '-created_at')
    
    fieldsets = (
        ('Application Details', {
            'fields': ('application_number', 'position', 'applicant', 'status')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone_number', 'address')
        }),
        ('Professional Information', {
            'fields': ('current_position', 'current_company', 'years_of_experience', 'expected_salary', 'availability_date')
        }),
        ('Application Content', {
            'fields': ('cover_letter', 'additional_notes')
        }),
        ('Review Process', {
            'fields': ('reviewed_by', 'reviewed_at', 'interview_date', 'interview_notes')
        }),
        ('Decision', {
            'fields': ('decision_date', 'decision_notes')
        }),
    )
    
    readonly_fields = ('application_number', 'submitted_at', 'reviewed_at', 'decision_date')
    
    actions = ['mark_under_review', 'shortlist_applications', 'schedule_interviews', 'reject_applications']
    
    def mark_under_review(self, request, queryset):
        queryset.update(status='under_review')
        self.message_user(request, f'{queryset.count()} applications marked as under review.')
    mark_under_review.short_description = 'Mark as under review'
    
    def shortlist_applications(self, request, queryset):
        queryset.update(status='shortlisted')
        self.message_user(request, f'{queryset.count()} applications shortlisted.')
    shortlist_applications.short_description = 'Shortlist applications'
    
    def schedule_interviews(self, request, queryset):
        queryset.update(status='interview_scheduled')
        self.message_user(request, f'{queryset.count()} interviews scheduled.')
    schedule_interviews.short_description = 'Schedule interviews'
    
    def reject_applications(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f'{queryset.count()} applications rejected.')
    reject_applications.short_description = 'Reject applications'

@admin.register(JobApplicationDocument)
class JobApplicationDocumentAdmin(admin.ModelAdmin):
    """
    Job Application Document admin interface
    """
    list_display = ('title', 'application', 'document_type', 'file_size_display', 'uploaded_at')
    list_filter = ('document_type', 'uploaded_at', 'application__position__department')
    search_fields = ('title', 'application__application_number', 'application__first_name', 'application__last_name')
    ordering = ('-uploaded_at',)
    
    fieldsets = (
        ('Document Details', {
            'fields': ('application', 'document_type', 'title', 'file', 'file_url')
        }),
        ('Metadata', {
            'fields': ('file_size', 'uploaded_at')
        }),
    )
    
    readonly_fields = ('file_size', 'uploaded_at')
    
    def file_size_display(self, obj):
        if obj.file_size:
            if obj.file_size < 1024:
                return f'{obj.file_size} B'
            elif obj.file_size < 1024 * 1024:
                return f'{obj.file_size / 1024:.1f} KB'
            else:
                return f'{obj.file_size / (1024 * 1024):.1f} MB'
        return 'Unknown'
    file_size_display.short_description = 'File Size'

@admin.register(JobInterview)
class JobInterviewAdmin(admin.ModelAdmin):
    """
    Job Interview admin interface
    """
    list_display = ('application', 'interview_type', 'scheduled_date', 'interviewer', 'status', 'rating')
    list_filter = ('interview_type', 'status', 'scheduled_date', 'application__position__department')
    search_fields = ('application__application_number', 'application__first_name', 'application__last_name', 'interviewer__email')
    ordering = ('-scheduled_date',)
    
    fieldsets = (
        ('Interview Details', {
            'fields': ('application', 'interview_type', 'scheduled_date', 'duration_minutes')
        }),
        ('Location & Access', {
            'fields': ('location', 'meeting_link')
        }),
        ('Interviewer & Status', {
            'fields': ('interviewer', 'status')
        }),
        ('Feedback', {
            'fields': ('notes', 'rating', 'feedback')
        }),
    )
    
    actions = ['mark_completed', 'mark_cancelled']
    
    def mark_completed(self, request, queryset):
        queryset.update(status='completed')
        self.message_user(request, f'{queryset.count()} interviews marked as completed.')
    mark_completed.short_description = 'Mark as completed'
    
    def mark_cancelled(self, request, queryset):
        queryset.update(status='cancelled')
        self.message_user(request, f'{queryset.count()} interviews cancelled.')
    mark_cancelled.short_description = 'Cancel interviews'
