from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.JobCategoryViewSet)
router.register(r'positions', views.JobPositionViewSet)
router.register(r'applications', views.JobApplicationViewSet)
router.register(r'documents', views.JobApplicationDocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]