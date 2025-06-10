from django.urls import path
from .views import UserPreferenceDetails, frontend_view
from .auth_view import login_view, logout_view ,csrf_view

urlpatterns = [
    path('preferences/<int:pk>/', UserPreferenceDetails.as_view(), name = 'preferences'),
    path('preferences/', frontend_view, name='frontend-view'),
    path('preferences/me/', UserPreferenceDetails.as_view(), name='preferences-me'),

    # Auth endpoints
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('csrf/', csrf_view, name='csrf'),
]