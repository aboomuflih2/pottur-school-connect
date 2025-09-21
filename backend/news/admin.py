from django.contrib import admin
from .models import NewsCategory, NewsPost, NewsComment, NewsLike

@admin.register(NewsCategory)
class NewsCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(NewsPost)
class NewsPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'is_featured', 'created_at']
    list_filter = ['category', 'status', 'is_featured', 'created_at']
    search_fields = ['title', 'content', 'tags']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(NewsComment)
class NewsCommentAdmin(admin.ModelAdmin):
    list_display = ['post', 'author', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['content', 'author__email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(NewsLike)
class NewsLikeAdmin(admin.ModelAdmin):
    list_display = ['post', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['post__title', 'user__email']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
