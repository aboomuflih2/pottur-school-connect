from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventCategoryViewSet, EventViewSet

router = DefaultRouter()
router.register(r'categories', EventCategoryViewSet)
router.register(r'events', EventViewSet)

urlpatterns = [
    path('', include(router.urls)),
]