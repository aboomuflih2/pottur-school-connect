from django.db import models
from django.conf import settings
import uuid

class NewsCategory(models.Model):
    """
    News categories for organizing news posts
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#10B981', help_text='Hex color code')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_categories'
        verbose_name = 'News Category'
        verbose_name_plural = 'News Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class NewsPost(models.Model):
    """
    News posts with publishing status and featured options
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True)
    category = models.ForeignKey(NewsCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='news_posts')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    featured_image = models.ImageField(upload_to='news/', blank=True, null=True)
    featured_image_url = models.URLField(blank=True)
    tags = models.CharField(max_length=255, blank=True, help_text='Comma-separated tags')
    views_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_posts'
        verbose_name = 'News Post'
        verbose_name_plural = 'News Posts'
        ordering = ['-published_at', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def is_published(self):
        return self.status == 'published'
    
    @property
    def tag_list(self):
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]

class NewsComment(models.Model):
    """
    Comments on news posts
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(NewsPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='news_comments')
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'news_comments'
        verbose_name = 'News Comment'
        verbose_name_plural = 'News Comments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.author.email} on {self.post.title}"
    
    @property
    def is_approved(self):
        return self.status == 'approved'

class NewsLike(models.Model):
    """
    Likes on news posts
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(NewsPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='news_likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'news_likes'
        verbose_name = 'News Like'
        verbose_name_plural = 'News Likes'
        unique_together = ['post', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} likes {self.post.title}"
