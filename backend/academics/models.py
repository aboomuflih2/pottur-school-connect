from django.db import models
from django.conf import settings
import uuid

class Department(models.Model):
    """
    Academic departments in the school
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    head_of_department = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'departments'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Program(models.Model):
    """
    Academic programs offered by departments
    """
    PROGRAM_TYPES = [
        ('undergraduate', 'Undergraduate'),
        ('postgraduate', 'Postgraduate'),
        ('diploma', 'Diploma'),
        ('certificate', 'Certificate'),
        ('professional', 'Professional'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    description = models.TextField(blank=True)
    program_type = models.CharField(max_length=20, choices=PROGRAM_TYPES)
    duration_years = models.PositiveIntegerField(help_text='Duration in years')
    duration_months = models.PositiveIntegerField(default=0, help_text='Additional months')
    credits_required = models.PositiveIntegerField(blank=True, null=True)
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'programs'
        verbose_name = 'Program'
        verbose_name_plural = 'Programs'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Course(models.Model):
    """
    Individual courses offered within programs
    """
    COURSE_TYPES = [
        ('core', 'Core'),
        ('elective', 'Elective'),
        ('prerequisite', 'Prerequisite'),
        ('capstone', 'Capstone'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20, unique=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='courses')
    description = models.TextField(blank=True)
    course_type = models.CharField(max_length=20, choices=COURSE_TYPES)
    credits = models.PositiveIntegerField()
    semester = models.CharField(max_length=20, blank=True)
    prerequisites = models.ManyToManyField('self', blank=True, symmetrical=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Faculty(models.Model):
    """
    Faculty members teaching courses
    """
    EMPLOYMENT_TYPES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('visiting', 'Visiting'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='faculty')
    designation = models.CharField(max_length=100)
    qualifications = models.TextField(blank=True)
    specialization = models.CharField(max_length=255, blank=True)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPES)
    join_date = models.DateField()
    office_location = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='faculty/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'faculty'
        verbose_name = 'Faculty'
        verbose_name_plural = 'Faculty'
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.designation}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Timetable(models.Model):
    """
    Class timetables and schedules
    """
    DAYS_OF_WEEK = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='timetables')
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='timetables')
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_number = models.CharField(max_length=50, blank=True)
    building = models.CharField(max_length=100, blank=True)
    semester = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=10)  # e.g., "2023-24"
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'timetables'
        verbose_name = 'Timetable'
        verbose_name_plural = 'Timetables'
        ordering = ['day_of_week', 'start_time']
        unique_together = ['course', 'day_of_week', 'start_time', 'semester', 'academic_year']
    
    def __str__(self):
        return f"{self.course.code} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"
    
    @property
    def duration_minutes(self):
        """Calculate duration in minutes"""
        from datetime import datetime, timedelta
        start = datetime.combine(datetime.today(), self.start_time)
        end = datetime.combine(datetime.today(), self.end_time)
        return int((end - start).total_seconds() / 60)
