from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Department, Program, Course, Faculty, Timetable
from .serializers import (
    DepartmentSerializer, ProgramSerializer, CourseSerializer,
    FacultySerializer, TimetableSerializer
)

# Create your views here.

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.filter(is_active=True).order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.filter(is_active=True).order_by('name')
    serializer_class = ProgramSerializer
    permission_classes = [AllowAny]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_active=True).order_by('program', 'semester', 'name')
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.filter(is_active=True).order_by('first_name', 'last_name')
    serializer_class = FacultySerializer
    permission_classes = [AllowAny]

class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.all().order_by('day_of_week', 'start_time')
    serializer_class = TimetableSerializer
    permission_classes = [AllowAny]