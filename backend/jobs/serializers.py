from rest_framework import serializers
from .models import JobPosition, JobApplication, JobCategory, JobApplicationDocument


class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class JobPositionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = JobPosition
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'views_count', 'applications_count')


class JobApplicationSerializer(serializers.ModelSerializer):
    position_title = serializers.CharField(source='position.title', read_only=True)
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    
    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'applicant', 'application_number')
        
    def create(self, validated_data):
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)


class JobApplicationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplicationDocument
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_at', 'file_size')