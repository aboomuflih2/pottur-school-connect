from django.http import JsonResponse
from django.urls import reverse

def api_root(request):
    """API root view that lists all available endpoints"""
    api_endpoints = {
        'admin': request.build_absolute_uri('/admin/'),
        'accounts': request.build_absolute_uri('/api/accounts/'),
        'events': request.build_absolute_uri('/api/events/'),
        'news': request.build_absolute_uri('/api/news/'),
        'academics': request.build_absolute_uri('/api/academics/'),
        'jobs': request.build_absolute_uri('/api/jobs/'),
        'content': request.build_absolute_uri('/api/content/'),
        'gallery': request.build_absolute_uri('/api/gallery/'),
        'admissions': request.build_absolute_uri('/api/admissions/'),
    }
    
    return JsonResponse({
        'message': 'Welcome to Pottur School Connect API',
        'version': '1.0',
        'endpoints': api_endpoints
    })