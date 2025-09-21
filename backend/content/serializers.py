from rest_framework import serializers
from .models import (
    HeroSlide, BreakingNews, PageContent,
    SchoolFeature, SchoolStats, StaffCounts, Testimonial,
    ContactSubmission, SocialMediaLink, BoardMember, LeadershipMessage, FileUpload,
    ContactPageContent, ContactAddress, ContactLocation
)

class ContactPageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactPageContent
        fields = '__all__'

class ContactAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactAddress
        fields = '__all__'

class ContactLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactLocation
        fields = '__all__'

class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = '__all__'

class LeadershipMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadershipMessage
        fields = '__all__'

class BoardMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardMember
        fields = '__all__'

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