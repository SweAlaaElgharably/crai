from django.db import models
from django.core.validators import MinValueValidator
from user.models import User
from content.models import Content

# Create your models here.
class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    content = models.ForeignKey(Content, on_delete=models.PROTECT, related_name="orders", null=True, blank=True)
    tap_charge_id = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    method = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user}"

class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    content = models.ForeignKey(Content, on_delete=models.PROTECT, related_name="enrollments")
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "content"], name="unique_enrollment",)]

    def __str__(self):
        return f"{self.user} - {self.content}"
