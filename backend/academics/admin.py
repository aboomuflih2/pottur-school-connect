from django.contrib import admin
from .models import Department, Program, Course, Faculty, Timetable


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'head_of_department', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'head_of_department']
    ordering = ['name']


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'department', 'program_type', 'duration_years', 'is_active']
    list_filter = ['department', 'program_type', 'is_active']
    search_fields = ['name', 'code']
    ordering = ['department', 'name']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'program', 'course_type', 'credits', 'semester', 'is_active']
    list_filter = ['program', 'course_type', 'semester', 'is_active']
    search_fields = ['name', 'code']
    ordering = ['program', 'semester', 'name']


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'employee_id', 'department', 'designation', 'employment_type', 'is_active']
    list_filter = ['department', 'designation', 'employment_type', 'is_active']
    search_fields = ['first_name', 'last_name', 'employee_id', 'email']
    ordering = ['last_name', 'first_name']


@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ['course', 'faculty', 'day_of_week', 'start_time', 'end_time', 'room_number', 'is_active']
    list_filter = ['day_of_week', 'semester', 'academic_year', 'is_active']
    search_fields = ['course__name', 'course__code', 'faculty__first_name', 'faculty__last_name']
    ordering = ['day_of_week', 'start_time']
