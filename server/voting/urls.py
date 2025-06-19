from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ElectionViewSet, VoteViewSet, ObtainTokenPairView, RefreshTokenView

router = DefaultRouter()
router.register(r'elections', ElectionViewSet, basename='election')
router.register(r'votes', VoteViewSet, basename='vote')


urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', ObtainTokenPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
]
