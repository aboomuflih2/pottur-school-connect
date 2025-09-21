from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import KgStdApplication, PlusOneApplication, InterviewSubject, InterviewSubjectTemplate
from .serializers import (
    KgStdApplicationSerializer, PlusOneApplicationSerializer,
    InterviewSubjectSerializer, InterviewSubjectTemplateSerializer
)

# Create your views here.

class KgStdApplicationViewSet(viewsets.ModelViewSet):
    queryset = KgStdApplication.objects.all().order_by('-created_at')
    serializer_class = KgStdApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create']:
            return [AllowAny()]
        return super().get_permissions()

class PlusOneApplicationViewSet(viewsets.ModelViewSet):
    queryset = PlusOneApplication.objects.all().order_by('-created_at')
    serializer_class = PlusOneApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create']:
            return [AllowAny()]
        return super().get_permissions()

class InterviewSubjectViewSet(viewsets.ModelViewSet):
    queryset = InterviewSubject.objects.filter(is_active=True).order_by('subject_name')
    serializer_class = InterviewSubjectSerializer
    permission_classes = [AllowAny]

class InterviewSubjectTemplateViewSet(viewsets.ModelViewSet):
    queryset = InterviewSubjectTemplate.objects.filter(is_active=True).order_by('template_name')
    serializer_class = InterviewSubjectTemplateSerializer
    permission_classes = [AllowAny]
