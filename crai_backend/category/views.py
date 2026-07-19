from rest_framework.viewsets import ModelViewSet
from .models import Category, SubCategory
from .serializers import CategorySerializer, SubCategorySerializer
from rest_framework.permissions import IsAdminUser, AllowAny

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    lookup_field = "slug"
    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            return [AllowAny()]
        return [IsAdminUser()]

class SubCategoryViewSet(ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAdminUser]
    lookup_field = "slug"
    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            return [AllowAny()]
        return [IsAdminUser()]
    