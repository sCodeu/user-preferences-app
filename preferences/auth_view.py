from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_POST
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_protect

@ensure_csrf_cookie
def csrf_view(request):
    return JsonResponse({'message': 'CSRF cookie set'})

@require_POST
@csrf_protect
def login_view(request):
    from django.views.decorators.csrf import csrf_protect
    from django.utils.datastructures import MultiValueDictKeyError

    username = request.POST.get("username")
    password = request.POST.get("password")
    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return JsonResponse({"message": "Login successful", "user_id": user.id})
    else:
        return JsonResponse({"error": "Invalid credentials"}, status=400)

@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Logged out"})
