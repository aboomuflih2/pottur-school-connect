from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GalleryPhoto
from .serializers import GalleryPhotoSerializer

# Create your views here.

class GalleryPhotoViewSet(viewsets.ModelViewSet):
    queryset = GalleryPhoto.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = GalleryPhotoSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category = request.query_params.get('category')
        if category:
            photos = self.queryset.filter(category=category)
            serializer = self.get_serializer(photos, many=True)
            return Response(serializer.data)
        return Response({'error': 'Category parameter required'}, status=400)

    @action(detail=False, methods=['get'])
    def by_tag(self, request):
        tag = request.query_params.get('tag')
        if tag:
            photos = self.queryset.filter(tags__icontains=tag)
            serializer = self.get_serializer(photos, many=True)
            return Response(serializer.data)
        return Response({'error': 'Tag parameter required'}, status=400)
