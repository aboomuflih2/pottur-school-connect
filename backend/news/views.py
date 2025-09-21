from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import NewsCategory, NewsPost, NewsComment, NewsLike
from .serializers import (
    NewsCategorySerializer, NewsPostSerializer, NewsCommentSerializer, NewsLikeSerializer
)


class NewsCategoryViewSet(viewsets.ModelViewSet):
    queryset = NewsCategory.objects.all().order_by('name')
    serializer_class = NewsCategorySerializer
    permission_classes = [AllowAny]


class NewsPostViewSet(viewsets.ModelViewSet):
    queryset = NewsPost.objects.filter(status='published').order_by('-published_at', '-created_at')
    serializer_class = NewsPostSerializer
    permission_classes = [AllowAny]


class NewsCommentViewSet(viewsets.ModelViewSet):
    queryset = NewsComment.objects.filter(status='approved').order_by('-created_at')
    serializer_class = NewsCommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NewsLikeViewSet(viewsets.ModelViewSet):
    queryset = NewsLike.objects.all()
    serializer_class = NewsLikeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
