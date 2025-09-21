from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import KgStdApplication, PlusOneApplication, InterviewSubject, InterviewSubjectTemplate, AdmissionForm
from .serializers import (
    KgStdApplicationSerializer, PlusOneApplicationSerializer,
    InterviewSubjectSerializer, InterviewSubjectTemplateSerializer,
    AdmissionFormSerializer
)

# Create your views here.

class KgStdApplicationViewSet(viewsets.ModelViewSet):
    queryset = KgStdApplication.objects.all().order_by('-created_at')
    serializer_class = KgStdApplicationSerializer
    permission_classes = [IsAuthenticated]

class PlusOneApplicationViewSet(viewsets.ModelViewSet):
    queryset = PlusOneApplication.objects.all().order_by('-created_at')
    serializer_class = PlusOneApplicationSerializer
    permission_classes = [IsAuthenticated]

class InterviewSubjectViewSet(viewsets.ModelViewSet):
    queryset = InterviewSubject.objects.all().order_by('subject_name')
    serializer_class = InterviewSubjectSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def save_marks(self, request):
        application_id = request.data.get('application_id')
        subjects = request.data.get('subjects')

        if not application_id or not subjects:
            return Response({'error': 'Missing application_id or subjects'}, status=status.HTTP_400_BAD_REQUEST)

        # Delete existing marks
        InterviewSubject.objects.filter(application_id=application_id).delete()

        # Create new marks
        for subject in subjects:
            InterviewSubject.objects.create(
                application_id=application_id,
                subject_name=subject['subject_name'],
                marks=subject['marks'],
                max_marks=subject['max_marks']
            )

        return Response({'status': 'success'})

class InterviewSubjectTemplateViewSet(viewsets.ModelViewSet):
    queryset = InterviewSubjectTemplate.objects.filter(is_active=True).order_by('template_name')
    serializer_class = InterviewSubjectTemplateSerializer
    permission_classes = [AllowAny]

class AdmissionFormViewSet(viewsets.ModelViewSet):
    queryset = AdmissionForm.objects.all().order_by('form_type')
    serializer_class = AdmissionFormSerializer
    permission_classes = [IsAuthenticated]
