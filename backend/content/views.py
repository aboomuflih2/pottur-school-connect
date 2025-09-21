from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import (
    HeroSlide, BreakingNews, PageContent,
    SchoolFeature, SchoolStats, StaffCounts, Testimonial,
    ContactSubmission, SocialMediaLink
)
from .serializers import (
    HeroSlideSerializer, BreakingNewsSerializer,
    PageContentSerializer, SchoolFeatureSerializer, SchoolStatsSerializer,
    StaffCountsSerializer, TestimonialSerializer, ContactSubmissionSerializer,
    SocialMediaLinkSerializer
)

# Create your views here.

class HeroSlideViewSet(viewsets.ModelViewSet):
    queryset = HeroSlide.objects.filter(is_active=True).order_by('order_index')
    serializer_class = HeroSlideSerializer
    permission_classes = [AllowAny]

class BreakingNewsViewSet(viewsets.ModelViewSet):
    queryset = BreakingNews.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = BreakingNewsSerializer
    permission_classes = [AllowAny]



class PageContentViewSet(viewsets.ModelViewSet):
    queryset = PageContent.objects.filter(is_active=True)
    serializer_class = PageContentSerializer
    permission_classes = [AllowAny]

class SchoolFeatureViewSet(viewsets.ModelViewSet):
    queryset = SchoolFeature.objects.filter(is_active=True).order_by('order_index')
    serializer_class = SchoolFeatureSerializer
    permission_classes = [AllowAny]

class SchoolStatsViewSet(viewsets.ModelViewSet):
    queryset = SchoolStats.objects.all().order_by('-created_at')
    serializer_class = SchoolStatsSerializer
    permission_classes = [AllowAny]

class StaffCountsViewSet(viewsets.ModelViewSet):
    queryset = StaffCounts.objects.all().order_by('-created_at')
    serializer_class = StaffCountsSerializer
    permission_classes = [AllowAny]

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]

class ContactSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ContactSubmission.objects.all().order_by('-created_at')
    serializer_class = ContactSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Allow anyone to create a contact submission; protect listing/modifying
        if self.action in ['create']:
            return [AllowAny()]
        return super().get_permissions()

class SocialMediaLinkViewSet(viewsets.ModelViewSet):
    queryset = SocialMediaLink.objects.filter(is_active=True).order_by('order_index')
    serializer_class = SocialMediaLinkSerializer
    permission_classes = [AllowAny]
