from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListAPIView
from .models import Content, Lesson
from .serializers import ContentSerializer, LessonSerializer, ContentPreviewSerializer
from rest_framework.permissions import IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination

# Create your views here.
class CustomPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 100

class ContentPreviewView(ListAPIView):
    serializer_class = ContentPreviewSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["show_in_home", "category_id", "subcategory_id"]
    queryset = Content.objects.filter(is_active=True)
    search_fields = ["arabic_title", "english_title"]
    pagination_class = CustomPagination
    # ordering_fields = ["real_price"]
    # ordering = ["real_price"]



# CRUD Admin
# CRUD Influencer
