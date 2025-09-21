from rest_framework import viewsets, status, parsers
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import (
    HeroSlide, BreakingNews, PageContent,
    SchoolFeature, SchoolStats, StaffCounts, Testimonial,
    ContactSubmission, SocialMediaLink, BoardMember, LeadershipMessage, FileUpload,
    ContactPageContent, ContactAddress, ContactLocation
)
from .serializers import (
    HeroSlideSerializer, BreakingNewsSerializer,
    PageContentSerializer, SchoolFeatureSerializer, SchoolStatsSerializer,
    StaffCountsSerializer, TestimonialSerializer, ContactSubmissionSerializer,
    SocialMediaLinkSerializer, BoardMemberSerializer, LeadershipMessageSerializer,
    FileUploadSerializer, ContactPageContentSerializer, ContactAddressSerializer,
    ContactLocationSerializer
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

class BoardMemberViewSet(viewsets.ModelViewSet):
    queryset = BoardMember.objects.filter(is_active=True).order_by('order_index')
    serializer_class = BoardMemberSerializer
    permission_classes = [AllowAny]

class LeadershipMessageViewSet(viewsets.ModelViewSet):
    queryset = LeadershipMessage.objects.filter(is_active=True).order_by('display_order')
    serializer_class = LeadershipMessageSerializer
    permission_classes = [AllowAny]

class FileUploadViewSet(viewsets.ModelViewSet):
    queryset = FileUpload.objects.all().order_by('-uploaded_at')
    serializer_class = FileUploadSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ContactPageContentViewSet(viewsets.ModelViewSet):
    queryset = ContactPageContent.objects.filter(is_active=True).order_by('display_order')
    serializer_class = ContactPageContentSerializer
    permission_classes = [AllowAny]

class ContactAddressViewSet(viewsets.ModelViewSet):
    queryset = ContactAddress.objects.filter(is_active=True).order_by('display_order')
    serializer_class = ContactAddressSerializer
    permission_classes = [AllowAny]

class ContactLocationViewSet(viewsets.ModelViewSet):
    queryset = ContactLocation.objects.filter(is_active=True).order_by('display_order')
    serializer_class = ContactLocationSerializer
    permission_classes = [AllowAny]

class ContactSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ContactSubmission.objects.all().order_by('-created_at')
    serializer_class = ContactSubmissionSerializer
    permission_classes = [IsAuthenticated]

class SocialMediaLinkViewSet(viewsets.ModelViewSet):
    queryset = SocialMediaLink.objects.filter(is_active=True).order_by('order_index')
    serializer_class = SocialMediaLinkSerializer
    permission_classes = [AllowAny]