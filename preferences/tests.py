from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from preferences.models import UserPreference

User = get_user_model()

class PreferenceAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass1234')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create initial preferences for the user
        self.pref = UserPreference.objects.create(
            user=self.user,
            email_notifications=True,
            push_notifications=False,
            notification_frequency="daily",
            theme_color="light",
            font_size="medium",
            layout="spacious",
            profile_visible=True,
            data_sharing=False
        )

    def test_get_preferences(self):
        response = self.client.get('/api/preferences/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user'], self.user.id)

    def test_update_preferences(self):
        data = {
            "username": "testuser",             
            "email": "test@example.com",         
            "user": self.user.id,  
            "email_notifications": False,
            "push_notifications": True,
            "notification_frequency": "weekly",
            "theme_color": "dark",
            "font_size": "large",
            "layout": "compact",
            "profile_visible": False,
            "data_sharing": True
        }

        response = self.client.put("/api/preferences/me/", data, format='json')

        # Debug print if test fails
        if response.status_code != 200:
            print("RESPONSE DATA:", response.data)

        self.assertEqual(response.status_code, 200)

        self.pref.refresh_from_db()
        self.assertFalse(self.pref.email_notifications)
        self.assertTrue(self.pref.push_notifications)
        self.assertEqual(self.pref.notification_frequency, "weekly")
        self.assertEqual(self.pref.theme_color, "dark")
        self.assertEqual(self.pref.font_size, "large")
        self.assertEqual(self.pref.layout, "compact")
        self.assertFalse(self.pref.profile_visible)
        self.assertTrue(self.pref.data_sharing)
