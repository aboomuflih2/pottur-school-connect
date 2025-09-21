from rest_framework import serializers
from .models import KgStdApplication, PlusOneApplication, InterviewSubject, InterviewSubjectTemplate

class KgStdApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = KgStdApplication
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class PlusOneApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlusOneApplication
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class InterviewSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewSubject
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class InterviewSubjectTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewSubjectTemplate
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']