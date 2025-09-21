from rest_framework import serializers
from .models import (
    HeroSlide, BreakingNews, PageContent,
    SchoolFeature, SchoolStats, StaffCounts, Testimonial,
    ContactSubmission, SocialMediaLink
)

class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class BreakingNewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakingNews
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']



class PageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContent
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class SchoolFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolFeature
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class SchoolStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolStats
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class StaffCountsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffCounts
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class SocialMediaLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMediaLink
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']