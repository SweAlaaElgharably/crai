from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentPreviewView

# router = DefaultRouter()
# router.register(r"categories", CategoryViewSet, basename="category")
# router.register(r"subcategories", SubCategoryViewSet, basename="subcategory")

urlpatterns = [
    path("contentpreview/", ContentPreviewView.as_view(), name="content-preview"),
    # path("", include(router.urls)),
]