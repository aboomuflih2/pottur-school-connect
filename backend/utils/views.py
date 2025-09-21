from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from admissions.models import KgStdApplication, PlusOneApplication

@api_view(['POST'])
def get_application_status(request):
    application_number = request.data.get('applicationNumber')
    mobile_number = request.data.get('mobileNumber')

    if not application_number or not mobile_number:
        return Response({'error': 'Application number and mobile number are required'}, status=400)

    application = None
    application_type = None

    try:
        application = KgStdApplication.objects.get(application_number=application_number, parent_phone=mobile_number)
        application_type = 'kg_std'
    except KgStdApplication.DoesNotExist:
        try:
            application = PlusOneApplication.objects.get(application_number=application_number, parent_phone=mobile_number)
            application_type = 'plus_one'
        except PlusOneApplication.DoesNotExist:
            return Response({'error': 'Application not found'}, status=404)

    # This is a simplified version. I will need to serialize the application object properly.
    return Response({
        'application': { 'id': application.id, 'status': application.application_status, 'application_number': application.application_number, 'full_name': application.student_name, 'mobile_number': application.parent_phone },
        'applicationType': application_type,
    })

@api_view(['POST'])
def generate_application_pdf(request):
    # Placeholder for PDF generation
    return Response({'error': 'Not implemented'}, status=501)

@api_view(['POST'])
def generate_interview_letter(request):
    # Placeholder for PDF generation
    return Response({'error': 'Not implemented'}, status=501)

@api_view(['POST'])
def generate_mark_list(request):
    # Placeholder for PDF generation
    return Response({'error': 'Not implemented'}, status=501)
