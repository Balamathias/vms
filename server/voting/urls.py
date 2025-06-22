from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenVerifyView

from .views import (
    ObtainTokenPairView, RefreshTokenView, LogoutView, CurrentUserView,
    StudentViewSet, ElectionViewSet, VoteViewSet, PositionViewSet, 
    CandidateViewSet, AdminDashboardView
)

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'elections', ElectionViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'votes', VoteViewSet)

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', ObtainTokenPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
    
    # Admin dashboard
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    
    # API endpoints
    path('', include(router.urls)),
]
