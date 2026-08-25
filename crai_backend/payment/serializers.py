from .models import Order
from rest_framework import serializers

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


from rest_framework import serializers
from .models import Enrollment


class ClientContentSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="content.title")
    content_id = serializers.IntegerField(source="content.id")
    cover = serializers.SerializerMethodField()
    price = serializers.DecimalField(
        source="content.price",
        max_digits=10,
        decimal_places=2
    )
    amount_paid = serializers.SerializerMethodField()
    purchased_at = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "content_id",
            "title",
            "cover",
            "price",
            "amount_paid",
            "purchased_at",
            "expires_at",
            "is_available",
        ]

    def get_cover(self, obj):
        if not obj.content.cover_image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(
            obj.content.cover_image.url
        ) if request else obj.content.cover_image.url

    def get_amount_paid(self, obj):
        order = (obj.user.orders.filter(content=obj.content, status="paid").order_by("-created_at").first())
        return order.amount if order else None
    def get_purchased_at(self, obj):
        order = (
            obj.user.orders
            .filter(
                content=obj.content,
                status="paid",
            )
            .order_by("-created_at")
            .first()
        )
        return order.created_at if order else obj.created_at
    def get_is_available(self, obj):
        from django.utils import timezone
        if obj.expires_at is None:
            return True
        return obj.expires_at > timezone.now()


class ClientDashboardSerializer(serializers.Serializer):
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    spent_this_month = serializers.DecimalField(max_digits=10, decimal_places=2)
    content = ClientContentSerializer(many=True)