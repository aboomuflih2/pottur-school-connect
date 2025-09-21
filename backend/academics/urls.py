from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, ProgramViewSet, CourseViewSet,
    FacultyViewSet, TimetableViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'faculty', FacultyViewSet)
router.register(r'timetables', TimetableViewSet)

urlpatterns = [
    path('', include(router.urls)),
]