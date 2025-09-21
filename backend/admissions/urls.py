from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    KgStdApplicationViewSet, PlusOneApplicationViewSet,
    InterviewSubjectViewSet, InterviewSubjectTemplateViewSet,
    AdmissionFormViewSet
)

router = DefaultRouter()
router.register(r'forms', AdmissionFormViewSet)
router.register(r'kg-std-applications', KgStdApplicationViewSet)
router.register(r'plus-one-applications', PlusOneApplicationViewSet)
router.register(r'interview-subjects', InterviewSubjectViewSet)
router.register(r'interview-subject-templates', InterviewSubjectTemplateViewSet)

urlpatterns = [
    path('interview-subjects/save_marks/', views.InterviewSubjectViewSet.as_view({'post': 'save_marks'}), name='interviewsubject-save-marks'),
    path('', include(router.urls)),
]