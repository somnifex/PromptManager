from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import pyotp

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Two-Factor Authentication
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.username

    def generate_two_factor_secret(self):
        if not self.two_factor_secret:
            self.two_factor_secret = pyotp.random_base32()
            self.save()
        return self.two_factor_secret

    def get_two_factor_uri(self):
        return pyotp.totp.TOTP(self.two_factor_secret).provisioning_uri(
            name=self.username,
            issuer_name="PromptManager"
        )

    def verify_two_factor_code(self, code):
        totp = pyotp.TOTP(self.two_factor_secret)
        return totp.verify(code)
