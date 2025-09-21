from django.contrib import admin
from .models import GalleryPhoto

@admin.register(GalleryPhoto)
class GalleryPhotoAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_featured', 'created_at']
    list_filter = ['category', 'is_featured', 'created_at']
    search_fields = ['title', 'description', 'tags']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
