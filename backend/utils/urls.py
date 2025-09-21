from django.urls import path
from . import views

urlpatterns = [
    path('get-application-status/', views.get_application_status, name='get_application_status'),
    path('generate-application-pdf/', views.generate_application_pdf, name='generate_application_pdf'),
    path('generate-interview-letter/', views.generate_interview_letter, name='generate_interview_letter'),
    path('generate-mark-list/', views.generate_mark_list, name='generate_mark_list'),
]
