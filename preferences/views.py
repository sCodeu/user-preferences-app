from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics,permissions
from .models import UserPreference
from .serializers import UserPreferenceSerializer
import os

class UserPreferenceDetails(generics.RetrieveUpdateAPIView):
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        pk = self.kwargs.get('pk')
        if pk is None or pk == 'me':
            obj, created = UserPreference.objects.get_or_create(user=self.request.user)
            return obj
        else:
            return UserPreference.objects.get(pk=pk)

def frontend_view(request):
    file_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'index.html')
    with open(file_path, 'r', encoding='utf-8') as f:
        return HttpResponse(f.read())