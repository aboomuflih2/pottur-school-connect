from rest_framework import serializers
from .models import NewsCategory, NewsPost, NewsComment, NewsLike

class NewsCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsCategory
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class NewsPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsPost
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class NewsCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsComment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class NewsLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsLike
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']