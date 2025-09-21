from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class HeroSlide(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    button_text = models.CharField(max_length=100, blank=True, null=True)
    button_link = models.URLField(blank=True, null=True)
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order_index', '-created_at']

    def __str__(self):
        return self.title


class BoardMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    board_type = models.CharField(max_length=50, choices=[('governing_board', 'Governing Board'), ('board_of_directors', 'Board of Directors')], default='governing_board')
    bio = models.TextField(blank=True)
    photo_url = models.URLField(blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order_index', 'name']
        verbose_name = 'Board Member'
        verbose_name_plural = 'Board Members'

    def __str__(self):
        return self.name


class LeadershipMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    person_name = models.CharField(max_length=255)
    person_title = models.CharField(max_length=255)
    position = models.CharField(max_length=50, choices=[('chairman', 'Chairman'), ('principal', 'Principal'), ('vice_principal', 'Vice Principal'), ('manager', 'Manager')])
    message_content = models.TextField()
    photo_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'person_name']
        verbose_name = 'Leadership Message'
        verbose_name_plural = 'Leadership Messages'

    def __str__(self):
        return self.person_name


class FileUpload(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name


class ContactPageContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content_type = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    content = models.TextField()
    additional_data = models.JSONField(default=dict, blank=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Contact Page Content'
        verbose_name_plural = 'Contact Page Contents'

    def __str__(self):
        return self.title

class ContactAddress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Contact Address'
        verbose_name_plural = 'Contact Addresses'

    def __str__(self):
        return self.title

class ContactLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    url = models.URLField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = 'Contact Location'
        verbose_name_plural = 'Contact Locations'

    def __str__(self):
        return self.title

class SchoolStats(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stat_name = models.CharField(max_length=100)
    stat_value = models.CharField(max_length=50)
    stat_label = models.CharField(max_length=100)
    icon = models.CharField(max_length=100, blank=True, null=True)
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order_index', 'stat_name']
        verbose_name_plural = 'School Stats'

    def __str__(self):
        return f"{self.stat_name}: {self.stat_value}"

class StaffCounts(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['department', 'position']
        verbose_name_plural = 'Staff Counts'

    def __str__(self):
        return f"{self.department} - {self.position}: {self.count}"

class Testimonial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    photo_url = models.URLField(blank=True, null=True)
    rating = models.IntegerField(default=5, choices=[(i, i) for i in range(1, 6)])
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return f"{self.name} - {self.designation}"

class ContactSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_replied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject}"

class SocialMediaLink(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    platform = models.CharField(max_length=50, choices=[
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('instagram', 'Instagram'),
        ('linkedin', 'LinkedIn'),
        ('youtube', 'YouTube'),
        ('whatsapp', 'WhatsApp'),
        ('telegram', 'Telegram'),
        ('other', 'Other')
    ])
    url = models.URLField()
    icon = models.CharField(max_length=100, blank=True, null=True)
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order_index', 'platform']

    def __str__(self):
        return f"{self.platform} - {self.url}"

class BreakingNews(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=1)
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name_plural = 'Breaking News'

    def __str__(self):
        return self.title

class PageContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page_name = models.CharField(max_length=100, unique=True)
    section_name = models.CharField(max_length=100)
    content_type = models.CharField(max_length=50, choices=[
        ('text', 'Text'),
        ('html', 'HTML'),
        ('markdown', 'Markdown'),
        ('json', 'JSON')
    ], default='text')
    content = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['page_name', 'section_name']

    def __str__(self):
        return f"{self.page_name} - {self.section_name}"

class SchoolFeature(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.CharField(max_length=100, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order_index', 'title']

    def __str__(self):
        return self.title
