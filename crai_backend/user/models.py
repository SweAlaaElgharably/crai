from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    headline = models.CharField(max_length=255, blank=True, null=True)
    is_influencer = models.BooleanField(default=False)
    country_code = models.CharField(max_length=5)
    phone = models.CharField(max_length=20)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username}"