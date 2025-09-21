from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class KgStdApplication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ])
    parent_name = models.CharField(max_length=255)
    parent_email = models.EmailField()
    parent_phone = models.CharField(max_length=20)
    address = models.TextField()
    previous_school = models.CharField(max_length=255, blank=True, null=True)
    grade_applying_for = models.CharField(max_length=50)
    application_status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('waitlisted', 'Waitlisted')
    ], default='pending')
    documents_submitted = models.BooleanField(default=False)
    interview_scheduled = models.BooleanField(default=False)
    interview_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'KG-STD Application'
        verbose_name_plural = 'KG-STD Applications'

    def __str__(self):
        return f"{self.student_name} - {self.grade_applying_for}"

class PlusOneApplication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ])
    parent_name = models.CharField(max_length=255)
    parent_email = models.EmailField()
    parent_phone = models.CharField(max_length=20)
    address = models.TextField()
    previous_school = models.CharField(max_length=255)
    sslc_marks = models.DecimalField(max_digits=5, decimal_places=2)
    stream_preference = models.CharField(max_length=100, choices=[
        ('science', 'Science'),
        ('commerce', 'Commerce'),
        ('humanities', 'Humanities')
    ])
    subjects_selected = models.TextField(help_text="Comma-separated list of subjects")
    application_status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('waitlisted', 'Waitlisted')
    ], default='pending')
    documents_submitted = models.BooleanField(default=False)
    entrance_exam_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    interview_scheduled = models.BooleanField(default=False)
    interview_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Plus One Application'
        verbose_name_plural = 'Plus One Applications'

    def __str__(self):
        return f"{self.student_name} - {self.stream_preference}"

class InterviewSubject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject_name = models.CharField(max_length=255)
    subject_code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    applicable_for = models.CharField(max_length=100, choices=[
        ('kg_std', 'KG-STD'),
        ('plus_one', 'Plus One'),
        ('both', 'Both')
    ], default='both')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['subject_name']

    def __str__(self):
        return f"{self.subject_code} - {self.subject_name}"

class InterviewSubjectTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template_name = models.CharField(max_length=255)
    subject = models.ForeignKey(InterviewSubject, on_delete=models.CASCADE, related_name='templates')
    question_text = models.TextField()
    question_type = models.CharField(max_length=50, choices=[
        ('multiple_choice', 'Multiple Choice'),
        ('short_answer', 'Short Answer'),
        ('essay', 'Essay'),
        ('practical', 'Practical'),
        ('oral', 'Oral')
    ], default='short_answer')
    options = models.JSONField(blank=True, null=True, help_text="For multiple choice questions")
    correct_answer = models.TextField(blank=True, null=True)
    marks = models.IntegerField(default=1)
    difficulty_level = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ], default='medium')
    order_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['subject', 'order_index', 'question_text']

    def __str__(self):
        return f"{self.template_name} - {self.subject.subject_name}"
