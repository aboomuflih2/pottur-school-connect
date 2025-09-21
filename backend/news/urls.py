from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NewsCategoryViewSet, NewsPostViewSet, NewsCommentViewSet, NewsLikeViewSet

router = DefaultRouter()
router.register(r'categories', NewsCategoryViewSet)
router.register(r'posts', NewsPostViewSet)
router.register(r'comments', NewsCommentViewSet)
router.register(r'likes', NewsLikeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]