from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    KgStdApplicationViewSet, PlusOneApplicationViewSet,
    InterviewSubjectViewSet, InterviewSubjectTemplateViewSet
)

router = DefaultRouter()
router.register(r'kg-std-applications', KgStdApplicationViewSet)
router.register(r'plus-one-applications', PlusOneApplicationViewSet)
router.register(r'interview-subjects', InterviewSubjectViewSet)
router.register(r'interview-subject-templates', InterviewSubjectTemplateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]