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

import os
import time
import json
import logging

from django.db.models import Prefetch, Q

from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

logger = logging.getLogger(__name__)

from rest_framework.decorators import action

from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.db import models
from django.db.utils import IntegrityError
from django.utils import timezone

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings

from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from rest_framework.filters import SearchFilter, OrderingFilter

from django.contrib.auth import get_user_model

from django.utils.timezone import now

from server.voting.serializers import TokenObtainPairSerializer
from utils.constants import APP_NAME
from utils.response import ResponseMixin
from utils.pagination import StackPagination

from .serializers import (
    ActiveElectionSerializer, VoteSerializer, StudentSerializer, # ... other serializers
)

from .models import Election, Vote


User = get_user_model()


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
            
            return self.response(
                data=response.data,
                message="Login successful.",
                status_code=status.HTTP_200_OK
            )
        
        return self.response(
            data=response.data,
            message="Login failed.",
            status_code=response.status_code
        )


class RefreshTokenView(TokenRefreshView):
    permission_classes = (AllowAny,)


class ElectionViewSet(viewsets.ReadOnlyModelViewSet, ResponseMixin):
    """
    A ViewSet for viewing elections and their results.
    Voting is handled by a separate VoteViewSet.
    """
    queryset = Election.objects.all().order_by('-start_date')
    permission_classes = [IsAuthenticated]
    serializer_class = ActiveElectionSerializer

    @action(detail=False, methods=['get'], url_path='active', permission_classes=[IsAuthenticated])
    def active_election(self, request):
        """
        Endpoint to get the single currently active election.
        GET /api/elections/active/
        """
        try:
            active_election = Election.objects.prefetch_related(
                'positions__candidates__student'
            ).get(is_active=True, start_date__lte=timezone.now(), end_date__gte=timezone.now())
        except Election.DoesNotExist:
            return self.response(
                error={"detail": "No active election found."},
                status_code=status.HTTP_404_NOT_FOUND,
                message="No active election is currently ongoing."
            )
        except Election.MultipleObjectsReturned:
            logger.error("Configuration Error: Multiple active elections found.")
            return self.response(
                error={"detail": "System error: Multiple active elections configured."},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Multiple active elections found."
            )

        serializer = self.get_serializer(active_election)
        return self.response(
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    @action(detail=True, methods=['get'], url_path='results', permission_classes=[IsAuthenticated])
    def results(self, request, pk=None):
        """
        Endpoint to get the results for a specific election, but only after it has ended.
        GET /api/elections/<election_id>/results/
        """
        election = self.get_object()
        if election.end_date > timezone.now():
            return self.response(
                error={"detail": "Results are not available until the election has ended."},
                status_code=status.HTTP_403_FORBIDDEN,
                message="Election has not ended."
            )

        results = Position.objects.filter(election=election).annotate(
            total_votes_for_position=Count('vote')
        ).prefetch_related(
            Prefetch(
                'candidates',
                queryset=Candidate.objects.annotate(vote_count=Count('vote'))
            )
        )
        
        response_data = []
        for position in results:
            pos_data = {
                "position_id": position.id,
                "position_name": position.name,
                "total_votes_in_position": position.total_votes_for_position,
                "candidates": []
            }
            for candidate in position.candidates.all():
                pos_data['candidates'].append({
                    "candidate_id": candidate.id,
                    "candidate_name": candidate.student.full_name,
                    'candidate_picture': candidate.photo.url,
                    "vote_count": candidate.vote_count
                })
            response_data.append(pos_data)

        return self.response(data=response_data, message="Election results retrieved successfully.")


class VoteViewSet(viewsets.GenericViewSet, viewsets.mixins.CreateModelMixin, ResponseMixin):
    """
    ViewSet for casting votes. Only allows creation.
    """
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Create a vote with custom response format.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            self.perform_create(serializer)
            return self.response(
                data=serializer.data,
                message="Vote cast successfully.",
                status_code=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return self.response(
                error={"detail": str(e)},
                message="Vote casting failed.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        """
        Set the voter to the currently authenticated user.
        Prevents a user from voting on behalf of someone else.
        """
        voter = self.request.user
        position = serializer.validated_data['position']

        if Vote.objects.filter(voter=voter, position=position).exists():
            raise ValidationError("You have already voted for this position.")

        serializer.save(voter=voter)