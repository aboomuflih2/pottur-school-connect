from django.contrib import admin
from .models import (
    HeroSlide, BreakingNews, PageContent, SchoolFeature,
    SchoolStats, StaffCounts, Testimonial, ContactSubmission,
    SocialMediaLink
)

@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'order_index', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'subtitle']
    ordering = ['order_index', '-created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(BreakingNews)
class BreakingNewsAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'priority', 'created_at']
    list_filter = ['is_active', 'priority', 'created_at']
    search_fields = ['title', 'content']
    ordering = ['-priority', '-created_at']

@admin.register(PageContent)
class PageContentAdmin(admin.ModelAdmin):
    list_display = ['page_name', 'section_name', 'updated_at']
    list_filter = ['page_name', 'section_name', 'updated_at']
    search_fields = ['page_name', 'section_name', 'content']
    ordering = ['page_name', 'section_name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(SchoolFeature)
class SchoolFeatureAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'order_index', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['order_index', '-created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(SchoolStats)
class SchoolStatsAdmin(admin.ModelAdmin):
    list_display = ['stat_label', 'stat_value', 'is_active', 'order_index']
    list_filter = ['is_active']
    search_fields = ['stat_label', 'stat_name']
    ordering = ['order_index']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(StaffCounts)
class StaffCountsAdmin(admin.ModelAdmin):
    list_display = ['department', 'position', 'count', 'updated_at']
    list_filter = ['department', 'updated_at']
    search_fields = ['department', 'position']
    ordering = ['department', 'position']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'designation', 'is_featured', 'created_at']
    list_filter = ['is_featured', 'created_at']
    search_fields = ['name', 'designation', 'content']
    ordering = ['-is_featured', '-created_at']

@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'subject']
    ordering = ['-created_at']
    readonly_fields = ['created_at']

@admin.register(SocialMediaLink)
class SocialMediaLinkAdmin(admin.ModelAdmin):
    list_display = ['platform', 'is_active', 'order_index']
    list_filter = ['platform', 'is_active']
    search_fields = ['platform', 'url']
    ordering = ['order_index']
    readonly_fields = ['created_at', 'updated_at']
