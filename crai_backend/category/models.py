from django.db import models

# Create your models here.
class Category(models.Model):
    english_title = models.CharField(max_length=50)
    arabic_title = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.english_title} | {self.arabic_title}"

class SubCategory(models.Model):
    english_title = models.CharField(max_length=50)
    arabic_title = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    
    def __str__(self):
        return f"{self.english_title} | {self.arabic_title}"