from django.contrib import admin
from .models import KgStdApplication, PlusOneApplication, InterviewSubject, InterviewSubjectTemplate

@admin.register(KgStdApplication)
class KgStdApplicationAdmin(admin.ModelAdmin):
    list_display = ['student_name', 'grade_applying_for', 'application_status', 'created_at']
    list_filter = ['grade_applying_for', 'application_status', 'created_at']
    search_fields = ['student_name', 'parent_name', 'parent_email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(PlusOneApplication)
class PlusOneApplicationAdmin(admin.ModelAdmin):
    list_display = ['student_name', 'stream_preference', 'application_status', 'created_at']
    list_filter = ['stream_preference', 'application_status', 'created_at']
    search_fields = ['student_name', 'parent_name', 'parent_email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(InterviewSubject)
class InterviewSubjectAdmin(admin.ModelAdmin):
    list_display = ['subject_name', 'subject_code', 'is_active']
    list_filter = ['is_active']
    search_fields = ['subject_name', 'subject_code', 'description']
    ordering = ['subject_name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(InterviewSubjectTemplate)
class InterviewSubjectTemplateAdmin(admin.ModelAdmin):
    list_display = ['subject', 'template_name', 'is_active', 'created_at']
    list_filter = ['subject', 'is_active', 'created_at']
    search_fields = ['template_name', 'question_text']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
