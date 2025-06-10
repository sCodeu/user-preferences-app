from django.contrib.auth.models import User
from django.db import models

class UserPreference(models.Model):
    user = models.OneToOneField(User , on_delete = models.CASCADE)

    username = models.CharField(max_length = 150)
    email = models.EmailField()

    #notification 
    email_notifications = models.BooleanField(default = True)
    push_notifications = models.BooleanField(default = True)
    notification_frequency = models.CharField(max_length = 20)

    #Theme
    theme_color = models.CharField(max_length = 20, default = 'light')
    font_size = models.CharField(max_length = 10, default = 'medium')
    layout = models.CharField(max_length = 10, default = 'default')

    #Privacy
    profile_visible = models.BooleanField(default = True)
    data_sharing = models.BooleanField(default = False)