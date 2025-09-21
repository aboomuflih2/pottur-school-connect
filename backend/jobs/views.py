from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import JobPosition, JobApplication, JobCategory, JobApplicationDocument
from .serializers import (
    JobPositionSerializer, JobApplicationSerializer, 
    JobCategorySerializer, JobApplicationDocumentSerializer
)


class JobCategoryViewSet(viewsets.ModelViewSet):
    queryset = JobCategory.objects.all().order_by('name')
    serializer_class = JobCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class JobPositionViewSet(viewsets.ModelViewSet):
    queryset = JobPosition.objects.all().order_by('-created_at')
    serializer_class = JobPositionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'])
    def published(self, request):
        published_jobs = self.queryset.filter(
            status='published',
            application_deadline__gte=timezone.now().date()
        )
        serializer = self.get_serializer(published_jobs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        employment_type = request.query_params.get('type')
        if employment_type:
            jobs = self.queryset.filter(employment_type=employment_type, status='published')
            serializer = self.get_serializer(jobs, many=True)
            return Response(serializer.data)
        return Response({'error': 'Type parameter required'}, status=400)


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all().order_by('-created_at')
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(applicant=self.request.user)

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        status = request.query_params.get('status')
        if status:
            applications = self.get_queryset().filter(status=status)
            serializer = self.get_serializer(applications, many=True)
            return Response(serializer.data)
        return Response({'error': 'Status parameter required'}, status=400)

    @action(detail=False, methods=['get'])
    def by_position(self, request):
        position_id = request.query_params.get('position')
        if position_id:
            applications = self.get_queryset().filter(position_id=position_id)
            serializer = self.get_serializer(applications, many=True)
            return Response(serializer.data)
        return Response({'error': 'Position parameter required'}, status=400)


class JobApplicationDocumentViewSet(viewsets.ModelViewSet):
    queryset = JobApplicationDocument.objects.all().order_by('-uploaded_at')
    serializer_class = JobApplicationDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(application__applicant=self.request.user)
