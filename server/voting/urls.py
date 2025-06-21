from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ElectionViewSet, VoteViewSet, ObtainTokenPairView, RefreshTokenView, CandidateViewSet, PositionViewSet, StudentViewSet, CurrentUserView, LogoutView

router = DefaultRouter()
router.register(r'elections', ElectionViewSet, basename='election')
router.register(r'votes', VoteViewSet, basename='vote')
router.register(r'candidates', CandidateViewSet, basename='candidate')
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'students', StudentViewSet, basename='student')


urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', ObtainTokenPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('auth/user/', CurrentUserView.as_view(), name='current_user'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
]
