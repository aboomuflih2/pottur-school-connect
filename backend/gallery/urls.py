from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GalleryPhotoViewSet

router = DefaultRouter()
router.register(r'photos', GalleryPhotoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]