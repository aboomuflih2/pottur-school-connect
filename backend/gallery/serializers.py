from rest_framework import serializers
from .models import GalleryPhoto

class GalleryPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryPhoto
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']