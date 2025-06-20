"""
+++++++++++++++++++
An entry point into my views:

Views include:
* Token obtain views
* Restframework restful views
* SIMPLE JWT implementation or overriding views.

It is quite the ultimate file that makes it possible...
that makes it possible for clients to communicate with the legalX application.
+++++++++++++++++++++
"""

from django.utils import timezone
from django.db.models import Count
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Election, Vote, Candidate, Student, Position
from .serializers import (
    TokenObtainPairSerializer, ActiveElectionSerializer, VoteSerializer,
    StudentSerializer, CandidateSerializer, PositionSerializer, DynamicCandidateSerializer
)
from utils.response import ResponseMixin

import logging
logger = logging.getLogger(__name__)


class ObtainTokenPairView(TokenObtainPairView, ResponseMixin):
    permission_classes = (AllowAny,)
    serializer_class = TokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.user
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            logger.info(f"User {user.matric_number} logged in successfully.")
            return self.response(data=response.data, message="Login successful.")
        return self.response(data=response.data, message="Login failed.", status_code=response.status_code)


class RefreshTokenView(TokenRefreshView, ResponseMixin):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            return self.response(data=response.data, message="Token refreshed successfully.")
        return self.response(data=response.data, message="Token refresh failed.", status_code=response.status_code)
    

class StudentViewSet(viewsets.ReadOnlyModelViewSet, ResponseMixin):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='qualified-candidates', permission_classes=[AllowAny])
    def qualified_candidates(self, request):
        """
        Returns a list of all students who are eligible to run for positions.
        """
        queryset = self.queryset.filter(level=500, status='active')
        serializer = self.get_serializer(queryset, many=True)
        return self.response(data=serializer.data, message="List of all qualified candidates.")


class ElectionViewSet(viewsets.ReadOnlyModelViewSet, ResponseMixin):
    queryset = Election.objects.all().order_by('-start_date')
    serializer_class = ActiveElectionSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='active')
    def active_election(self, request):
        try:
            active = Election.objects.prefetch_related('positions') \
                                      .get(is_active=True, start_date__lte=timezone.now(), end_date__gte=timezone.now())
        except Election.DoesNotExist:
            return self.response(error={"detail": "No active election found."}, status_code=404)
        except Election.MultipleObjectsReturned:
            return self.response(error={"detail": "Multiple active elections found."}, status_code=500)
        return self.response(data=self.get_serializer(active).data)

    @action(detail=True, methods=['get'], url_path='results')
    def results(self, request, pk=None):
        election = self.get_object()
        if election.end_date > timezone.now() and not request.user.is_staff:
            return self.response(error={"detail": "Results not available until the election ends."}, status_code=403)

        vote_data = Vote.objects.filter(position__election=election) \
            .values('position__id', 'position__name', 'student_voted_for__id', 'student_voted_for__full_name') \
            .annotate(vote_count=Count('id')).order_by('position__name', '-vote_count')

        grouped = {}
        for vote in vote_data:
            pid = vote['position__id']
            grouped.setdefault(pid, {
                'position_id': pid,
                'position_name': vote['position__name'],
                'candidates': []
            })['candidates'].append({
                'student_id': vote['student_voted_for__id'],
                'student_name': vote['student_voted_for__full_name'],
                'vote_count': vote['vote_count']
            })

        return self.response(data=list(grouped.values()), message="Election results retrieved successfully.")


class VoteViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin, ResponseMixin):
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
            return self.response(data=serializer.data, message="Vote cast successfully.", status_code=201)
        except ValidationError as e:
            return self.response(error={"detail": str(e)}, status_code=400)

    def perform_create(self, serializer):
        voter = self.request.user
        position = serializer.validated_data['position']
        if Vote.objects.filter(voter=voter, position=position).exists():
            raise ValidationError("You have already voted for this position.")
        serializer.save(voter=voter)


class PositionViewSet(viewsets.ReadOnlyModelViewSet, ResponseMixin):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'], url_path='candidates')
    def candidates(self, request, pk=None):
        position = self.get_object()
        students = Student.objects.filter(level=500, status='active')
        context = self.get_serializer_context()
        context['position'] = position
        serializer = DynamicCandidateSerializer(students, many=True, context=context)
        return self.response(data=serializer.data, message="Candidates for position retrieved successfully.")


class CandidateViewSet(viewsets.ModelViewSet, ResponseMixin):
    queryset = Candidate.objects.select_related('student', 'position')
    serializer_class = CandidateSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(student=self.request.user)

    def create(self, request, *args, **kwargs):
        student = request.user
        position_id = request.data.get("position")
        if not position_id:
            return self.response(error={"detail": "Position is required."}, status_code=400)

        if Candidate.objects.filter(student=student, position_id=position_id).exists():
            return self.response(error={"detail": "Enhancement already exists for this position."}, status_code=400)

        request.data["student"] = student.id
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    def update(self, request, *args, **kwargs):
        candidate = self.get_object()
        if candidate.student != request.user and not request.user.is_staff:
            return self.response(error={"detail": "You can only update your own enhancement."}, status_code=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        candidate = self.get_object()
        if candidate.student != request.user and not request.user.is_staff:
            return self.response(error={"detail": "You can only delete your own enhancement."}, status_code=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='qualified')
    def qualified_candidates(self, request):
        queryset = self.queryset.filter(student__level=500, student__status='active')
        serializer = self.get_serializer(queryset, many=True)
        return self.response(data=serializer.data, message="List of all qualified candidates.")
