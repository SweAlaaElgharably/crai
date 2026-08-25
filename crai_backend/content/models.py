from django.db import models
from django.utils import timezone
from category.models import Category
from user.models import User
from django.core.validators import MinValueValidator

# Create your models here.
class Content(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        SCHEDULED = "scheduled", "Scheduled"
    title = models.CharField(max_length=255)
    cover_image = models.ImageField(upload_to="contents/covers/", null=True, blank=True)
    body = models.JSONField(default=dict)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contents")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="contents")
    access_duration_days = models.PositiveIntegerField(default=30)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    share_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_free(self):
        return self.price == 0

    @property
    def is_published(self):
        return self.status == self.Status.PUBLISHED

    @classmethod
    def publish_due(cls):
        now = timezone.now()
        due = list(cls.objects.filter(status=cls.Status.SCHEDULED, scheduled_at__lte=now))
        if due:
            cls.objects.filter(id__in=[c.id for c in due]).update(status=cls.Status.PUBLISHED, published_at=now)
        return len(due)

    def __str__(self):
        return self.title


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "content"], name="unique_like")]

    def __str__(self):
        return f"{self.user} likes {self.content}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name="comments")
    body = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"{self.user} on {self.content}"
