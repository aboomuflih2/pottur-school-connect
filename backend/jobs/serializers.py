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
    cv_file = serializers.FileField(write_only=True, required=False)
    
    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'applicant', 'application_number')
        
    def create(self, validated_data):
        cv_file = validated_data.pop('cv_file', None)
        validated_data['applicant'] = self.context['request'].user
        application = super().create(validated_data)

        if cv_file:
            JobApplicationDocument.objects.create(
                application=application,
                document_type='resume',
                title=cv_file.name,
                file=cv_file
            )

        return application


class JobApplicationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplicationDocument
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_at', 'file_size')