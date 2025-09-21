from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HeroSlideViewSet, BreakingNewsViewSet, PageContentViewSet,
    SchoolFeatureViewSet, SchoolStatsViewSet, StaffCountsViewSet,
    TestimonialViewSet, ContactSubmissionViewSet, SocialMediaLinkViewSet,
    BoardMemberViewSet, LeadershipMessageViewSet, FileUploadViewSet,
    ContactPageContentViewSet, ContactAddressViewSet, ContactLocationViewSet
)

router = DefaultRouter()
router.register(r'contact-page-content', ContactPageContentViewSet)
router.register(r'contact-addresses', ContactAddressViewSet)
router.register(r'contact-locations', ContactLocationViewSet)
router.register(r'file-uploads', FileUploadViewSet)
router.register(r'leadership-messages', LeadershipMessageViewSet)
router.register(r'board-members', BoardMemberViewSet)
router.register(r'hero-slides', HeroSlideViewSet)
router.register(r'breaking-news', BreakingNewsViewSet)
router.register(r'page-content', PageContentViewSet)
router.register(r'school-features', SchoolFeatureViewSet)
router.register(r'school-stats', SchoolStatsViewSet)
router.register(r'staff-counts', StaffCountsViewSet)
router.register(r'testimonials', TestimonialViewSet)
router.register(r'contact-submissions', ContactSubmissionViewSet)
router.register(r'social-media-links', SocialMediaLinkViewSet)

urlpatterns = [
    path('', include(router.urls)),
]