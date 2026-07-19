from rest_framework.generics import ListAPIView
from .models import User
from .serializers import InfluencerSerializer 

# Create your views here.
class InfluencerListView(ListAPIView):
    queryset = User.objects.filter(is_influencer=True, is_verified=True)
    serializer_class = InfluencerSerializer