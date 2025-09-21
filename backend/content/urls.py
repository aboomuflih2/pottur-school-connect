from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HeroSlideViewSet, BreakingNewsViewSet, PageContentViewSet,
    SchoolFeatureViewSet, SchoolStatsViewSet, StaffCountsViewSet,
    TestimonialViewSet, ContactSubmissionViewSet, SocialMediaLinkViewSet
)

router = DefaultRouter()
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