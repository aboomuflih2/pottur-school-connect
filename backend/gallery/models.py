from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class GalleryPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField()
    thumbnail_url = models.URLField(blank=True, null=True)
    category = models.CharField(max_length=100, choices=[
        ('events', 'Events'),
        ('campus', 'Campus'),
        ('students', 'Students'),
        ('activities', 'Activities'),
        ('achievements', 'Achievements'),
        ('facilities', 'Facilities'),
        ('other', 'Other')
    ], default='other')
    tags = models.CharField(max_length=500, blank=True, null=True, help_text="Comma-separated tags")
    order_index = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', 'order_index', '-created_at']

    def __str__(self):
        return self.title

    def get_tags_list(self):
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',')]
        return []
