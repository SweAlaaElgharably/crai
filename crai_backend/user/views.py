from datetime import timedelta
from django.db.models import Count, Q, Exists, OuterRef, Prefetch, Min, Max, Sum
from django.db.models.functions import TruncMonth, TruncDate
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User, UserFollow
from .serializers import InfluencerDiscoverySerializer, InfluencerFollowerSerializer, InfluencerSubscriberSerializer
from content.models import Content
from payment.models import Enrollment, Order
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from user.serializers import InfluencerProfileSerializer

class InfluencerDiscoveryView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        seven_days_ago = timezone.now() - timedelta(days=7)
        base_queryset = (User.objects.filter(user_type=User.UserType.INFLUENCER)
            .annotate(
                followers_count=Count("followers", distinct=True),
                enrollments_count=Count("contents__enrollments", distinct=True),
            )
        )
        # Featured
        featured = base_queryset.order_by("-followers_count", "-id")[:10]
        # Trending
        trending = (base_queryset
            .annotate(
                recent_followers_count=Count(
                    "followers",
                    filter=Q(followers__created_at__gte=seven_days_ago),
                    distinct=True,
                )
            ).order_by("-recent_followers_count", "-followers_count", "-id")[:10]
        )
        # Top
        top = base_queryset.order_by("-followers_count", "-enrollments_count", "-id")[:10]
        # New
        new = base_queryset.order_by("-date_joined", "-id")[:10]
        # Recommended
        recommended = User.objects.none()
        if request.user.is_authenticated:
            user_interests = request.user.interests.all()
            if user_interests.exists():
                recommended = (User.objects.filter(user_type=User.UserType.INFLUENCER, interests__in=user_interests)
                    .annotate(
                        matching_interests=Count(
                            "interests",
                            filter=Q(interests__in=user_interests),
                            distinct=True,
                        ),
                        followers_count=Count("followers", distinct=True),
                        enrollments_count=Count("contents__enrollments", distinct=True),
                    ).order_by("-matching_interests", "-followers_count", "-id")[:10]
                )
        return Response({
            "featured": InfluencerDiscoverySerializer(featured, many=True).data,
            "trending": InfluencerDiscoverySerializer(trending, many=True).data,
            "top": InfluencerDiscoverySerializer(top, many=True).data,
            "new": InfluencerDiscoverySerializer(new, many=True).data,
            "recommended": InfluencerDiscoverySerializer(recommended, many=True).data,
        })

class InfluencerPagination(PageNumberPagination):
    page_size = 48
    page_size_query_param = "page_size"
    max_page_size = 96

class InfluencerListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = InfluencerDiscoverySerializer
    pagination_class = InfluencerPagination
    def get_queryset(self):
        queryset = (User.objects
            .filter(user_type=User.UserType.INFLUENCER)
            .annotate(followers_count=Count("followers", distinct=True))
        )
        search = self.request.query_params.get("search")
        interest = self.request.query_params.get("interest")
        if search:
            queryset = queryset.filter(Q(username__icontains=search) | Q(first_name__icontains=search)
                | Q(last_name__icontains=search) | Q(headline__icontains=search)
            )
        if interest:
            queryset = queryset.filter(interests__id=interest)
        return queryset.order_by("-followers_count", "-id")

# class InfluencerProfileView(APIView):
#     permission_classes = [AllowAny]
#     def get(self, request, username):
#         follow_exists = UserFollow.objects.filter(follower=request.user, following=OuterRef("pk"))
#         queryset = (User.objects.filter(username=username, user_type="influencer").annotate(
#                 followers_count=Count("followers", distinct=True),
#                 following_count=Count("following", distinct=True),
#                 content_count=Count("contents", filter=Q(contents__is_publish=True), distinct=True),
#                 following=Exists(follow_exists),
#             )
#         )
#         influencer = queryset.first()
#         if not influencer:
#             return Response({"detail": "Influencer not found."}, status=status.HTTP_404_NOT_FOUND)
#         serializer = InfluencerProfileSerializer(influencer, context={"request": request})
#         return Response({"data": serializer.data})

class InfluencerProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        Content.publish_due()
        influencer = (
            User.objects
            .filter(
                username=username,
                user_type="influencer"
            )
            .annotate(
                followers_count=Count(
                    "followers",
                    distinct=True
                ),
                following_count=Count(
                    "following",
                    distinct=True
                ),
                content_count=Count(
                    "contents",
                    filter=Q(contents__status="published"),
                    distinct=True
                ),
            )
            .prefetch_related(
                Prefetch(
                    "contents",
                    queryset=Content.objects.filter(status="published").select_related("owner"),
                )
            )
            .first()
        )

        if not influencer:
            return Response(
                {"detail": "Influencer not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.is_authenticated:
            influencer.is_following = UserFollow.objects.filter(
                follower=request.user,
                following=influencer
            ).exists()
        else:
            influencer.is_following = False

        serializer = InfluencerProfileSerializer(
            influencer,
            context={"request": request}
        )

        return Response({
            "data": serializer.data
        })

class InfluencerFollowView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, username):
        influencer = User.objects.filter(username=username, user_type="influencer").first()
        if not influencer:
            return Response({"detail": "Influencer not found."}, status=status.HTTP_404_NOT_FOUND)
        if influencer.id == request.user.id:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)
        follow, created = UserFollow.objects.get_or_create(follower=request.user, following=influencer)
        if not created:
            return Response({"detail": "Already following.", "following": True}, status=status.HTTP_200_OK)
        return Response({"detail": "Followed successfully.", "following": True}, status=status.HTTP_201_CREATED)

    def delete(self, request, username):
        influencer = User.objects.filter(username=username, user_type="influencer").first()
        if not influencer:
            return Response({"detail": "Influencer not found."}, status=status.HTTP_404_NOT_FOUND)
        deleted, _ = UserFollow.objects.filter(follower=request.user, following=influencer).delete()
        return Response(
            {
                "detail": ("Unfollowed successfully." if deleted else "You are not following this influencer."),
                "following": False,
            },
            status=status.HTTP_200_OK,
        )

class InfluencerFollowToggleView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, username):
        influencer = User.objects.filter(username=username, user_type="influencer").first()
        if not influencer:
            return Response({"detail": "Influencer not found."}, status=status.HTTP_404_NOT_FOUND)
        if influencer.id == request.user.id:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)
        follow, created = UserFollow.objects.get_or_create(follower=request.user, following=influencer)
        if created:
            followers_count = UserFollow.objects.filter(following=influencer).count()
            return Response({"detail": "Followed successfully.", "following": True, "followers_count": followers_count}, status=status.HTTP_201_CREATED)
        follow.delete()
        followers_count = UserFollow.objects.filter(following=influencer).count()
        return Response({"detail": "Unfollowed successfully.", "following": False, "followers_count": followers_count}, status=status.HTTP_200_OK)

def _monthly_series(queryset, field, months):
    by_month = {
        row["month"].strftime("%Y-%m"): row["count"]
        for row in (
            queryset
            .annotate(month=TruncMonth(field))
            .values("month")
            .annotate(count=Count("id"))
        )
    }
    return [by_month.get(month.strftime("%Y-%m"), 0) for month in months]

class InfluencerSubscribersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != User.UserType.INFLUENCER and not request.user.is_staff:
            return Response(
                {"detail": "Only influencers can view subscribers."},
                status=status.HTTP_403_FORBIDDEN,
            )

        follows = (
            UserFollow.objects
            .filter(following=request.user)
            .select_related("follower")
            .order_by("created_at", "id")
        )
        followers_all = InfluencerFollowerSerializer(follows, many=True).data
        followers_recent = list(reversed(followers_all[-10:]))

        owner_enrollment = Q(enrollments__content__owner=request.user)
        subscribers_qs = (
            User.objects
            .filter(owner_enrollment)
            .annotate(
                subscribed_at=Min("enrollments__created_at", filter=owner_enrollment),
                last_purchase_at=Max("enrollments__created_at", filter=owner_enrollment),
                purchases_count=Count("enrollments", filter=owner_enrollment, distinct=True),
            )
            .order_by("subscribed_at", "id")
        )
        subscribers_all = InfluencerSubscriberSerializer(subscribers_qs, many=True).data
        subscribers_recent = list(reversed(subscribers_all[-10:]))

        now = timezone.now()
        months = []
        cursor = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        for _ in range(6):
            months.append(cursor)
            cursor = (cursor - timedelta(days=1)).replace(day=1)
        months.reverse()

        new_followers = _monthly_series(
            UserFollow.objects.filter(following=request.user, created_at__gte=months[0]),
            "created_at",
            months,
        )
        new_subscribers = _monthly_series(
            Enrollment.objects.filter(content__owner=request.user, created_at__gte=months[0]),
            "created_at",
            months,
        )

        return Response({
            "summary": {
                "followers_count": len(followers_all),
                "subscribers_count": len(subscribers_all),
            },
            "followers": {
                "total": len(followers_all),
                "all": followers_all,
                "recent": followers_recent,
            },
            "subscribers": {
                "total": len(subscribers_all),
                "all": subscribers_all,
                "recent": subscribers_recent,
            },
            "charts": {
                "months": [m.strftime("%b %Y") for m in months],
                "new_followers": new_followers,
                "new_subscribers": new_subscribers,
            },
        })


def _period_counts(queryset, field, now):
    return {
        "daily": queryset.filter(**{f"{field}__gte": now.replace(hour=0, minute=0, second=0, microsecond=0)}).count(),
        "weekly": queryset.filter(**{f"{field}__gte": now - timedelta(days=7)}).count(),
        "monthly": queryset.filter(**{f"{field}__gte": now - timedelta(days=30)}).count(),
        "forever": queryset.count(),
    }


def _growth_series(queryset, field, now, days=30):
    start = (now - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)
    running = queryset.filter(**{f"{field}__lt": start}).count()
    per_day = {
        row["day"]: row["count"]
        for row in (
            queryset
            .filter(**{f"{field}__gte": start})
            .annotate(day=TruncDate(field))
            .values("day")
            .annotate(count=Count("id"))
        )
    }
    labels, values = [], []
    for i in range(days):
        day = (start + timedelta(days=i)).date()
        running += per_day.get(day, 0)
        labels.append(day.strftime("%d %b"))
        values.append(running)
    return {"labels": labels, "values": values}


class InfluencerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != User.UserType.INFLUENCER and not request.user.is_staff:
            return Response(
                {"detail": "Only influencers can view analytics."},
                status=status.HTTP_403_FORBIDDEN,
            )

        now = timezone.now()

        paid_orders = Order.objects.filter(content__owner=request.user, status=Order.Status.PAID)
        total_revenue = paid_orders.aggregate(total=Sum("amount"))["total"] or 0
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        revenue_this_month = paid_orders.filter(created_at__gte=month_start).aggregate(total=Sum("amount"))["total"] or 0

        months = []
        cursor = month_start
        for _ in range(6):
            months.append(cursor)
            cursor = (cursor - timedelta(days=1)).replace(day=1)
        months.reverse()
        revenue_by_month = {
            row["month"].strftime("%Y-%m"): row["total"]
            for row in (
                paid_orders
                .filter(created_at__gte=months[0])
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(total=Sum("amount"))
            )
        }

        followers_qs = UserFollow.objects.filter(following=request.user)
        subscribers_qs = Enrollment.objects.filter(content__owner=request.user)

        return Response({
            "revenue": {
                "total": total_revenue,
                "this_month": revenue_this_month,
                "monthly": {
                    "labels": [m.strftime("%b %Y") for m in months],
                    "values": [float(revenue_by_month.get(m.strftime("%Y-%m"), 0)) for m in months],
                },
            },
            "followers": {
                **_period_counts(followers_qs, "created_at", now),
                "growth": _growth_series(followers_qs, "created_at", now),
            },
            "subscribers": {
                **_period_counts(subscribers_qs, "created_at", now),
                "growth": _growth_series(subscribers_qs, "created_at", now),
            },
        })