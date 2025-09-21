from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import EventCategory, Event
from .serializers import EventCategorySerializer, EventSerializer


class EventCategoryViewSet(viewsets.ModelViewSet):
    queryset = EventCategory.objects.all().order_by('name')
    serializer_class = EventCategorySerializer
    permission_classes = [AllowAny]


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.filter(is_published=True).order_by('-event_date')
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
