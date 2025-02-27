
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse


@csrf_exempt
def test(request: HttpRequest): 
    return HttpResponse("hello world") 
@csrf_exempt
def health_check(request):
    return HttpResponse("OK", content_type="text/plain", status=200)

@csrf_exempt
def error_response(message, details=None, status=400):
    response = {"error": {"message": message}}
    if details:
        response["error"]["details"] = details
    return JsonResponse(response, status=status)