from django.contrib import admin
from .models import EventCategory, Event

@admin.register(EventCategory)
class EventCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'event_date', 'is_featured', 'created_at']
    list_filter = ['category', 'is_featured', 'event_date', 'created_at']
    search_fields = ['title', 'description', 'location']
    ordering = ['-event_date']
    readonly_fields = ['created_at', 'updated_at']
