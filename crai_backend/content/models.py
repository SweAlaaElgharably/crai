from django.db import models
from category.models import Category, SubCategory
from user.models import User

# Create your models here.
class Content(models.Model):
    english_title = models.CharField(max_length=255)
    arabic_title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    english_description = models.TextField()
    arabic_description = models.TextField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contents")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="contents")
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name="contents")
    image = models.ImageField(upload_to="contents/")
    fake_price = models.DecimalField(max_digits=10, decimal_places=2)
    real_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=False)
    show_in_home = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.english_title} | {self.arabic_title}"
    
class Lesson(models.Model):
    english_title = models.CharField(max_length=255)
    arabic_title = models.CharField(max_length=255)
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name="lessons")
    video = models.FileField(upload_to="lessons/")
    file = models.FileField(upload_to="lessons/files/")

    def __str__(self):
        return f"{self.english_title} | {self.arabic_title}"