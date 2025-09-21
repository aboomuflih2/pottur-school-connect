from django.db import models
from django.conf import settings
import uuid

class EventCategory(models.Model):
    """
    Event categories for organizing events
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6', help_text='Hex color code')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'event_categories'
        verbose_name = 'Event Category'
        verbose_name_plural = 'Event Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Event(models.Model):
    """
    School events with publishing status and featured options
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    event_date = models.DateTimeField()
    end_date = models.DateTimeField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True)
    category = models.ForeignKey(EventCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    image_url = models.URLField(blank=True)
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    max_attendees = models.PositiveIntegerField(blank=True, null=True)
    registration_required = models.BooleanField(default=False)
    registration_deadline = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'events'
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        ordering = ['-event_date']
    
    def __str__(self):
        return self.title
    
    @property
    def is_past(self):
        from django.utils import timezone
        return self.event_date < timezone.now()
    
    @property
    def is_upcoming(self):
        from django.utils import timezone
        return self.event_date > timezone.now()

class EventRegistration(models.Model):
    """
    Event registrations for tracking attendees
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_registrations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    registration_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'event_registrations'
        verbose_name = 'Event Registration'
        verbose_name_plural = 'Event Registrations'
        unique_together = ['event', 'user']
        ordering = ['-registration_date']
    
    def __str__(self):
        return f"{self.user.email} - {self.event.title}"
