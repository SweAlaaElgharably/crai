from django.contrib.auth.models import AbstractUser
from django.db import models
from category.models import Category

class User(AbstractUser):
    class UserType(models.TextChoices):
        CLIENT = "client", "Client"
        INFLUENCER = "influencer", "Influencer"
    email = models.EmailField("email address", unique=True)
    user_type = models.CharField(max_length=20, choices=UserType.choices, default=UserType.CLIENT, db_index=True)
    headline = models.CharField(max_length=255, blank=True, null=True)
    country_code = models.CharField(max_length=5)
    phone = models.CharField(max_length=20, unique=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    interests = models.ManyToManyField(Category, related_name="users", blank=True)

    def __str__(self):
        return self.username

class UserFollow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["follower", "following"], name="unique_user_follow",),
            models.CheckConstraint(condition=~models.Q(follower=models.F("following")), name="prevent_self_follow"),
        ]

    def __str__(self):
        return f"{self.follower} follows {self.following}"