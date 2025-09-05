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

import csv
import io
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth.hashers import make_password
from django.conf import settings
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.cache import cache
from datetime import timedelta, datetime
import csv, io, logging, time
from django.db import transaction
import logging

from .models import Election, Vote, Candidate, Student, Position, LoginAttempt, IPRestriction
from .serializers import (
    ChangePasswordSerializer, TokenObtainPairSerializer, ActiveElectionSerializer, VoteSerializer,
    StudentSerializer, CandidateSerializer, PositionSerializer, DynamicCandidateSerializer
)
from utils.response import ResponseMixin
from .middleware import SecurityMiddleware

logger = logging.getLogger(__name__)


class ObtainTokenPairView(TokenObtainPairView, ResponseMixin):
    permission_classes = (AllowAny,)
    serializer_class = TokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        matric_number = getattr(request.data, 'get', lambda x, default: default)('matric_number', '').upper()
        
        if self.detect_suspicious_activity(ip_address, matric_number):
            return self.response(
                data={}, 
                message="Suspicious activity detected. Please try again later.", 
                status_code=429
            )
        
        if matric_number and self.is_account_locked(matric_number):
            return self.response(
                data={}, 
                message="Account temporarily locked due to multiple failed attempts.", 
                status_code=423
            )
        
        response = super().post(request, *args, **kwargs)
        
        LoginAttempt.objects.create(
            ip_address=ip_address,
            user_agent=user_agent,
            matric_number=matric_number,
            success=response.status_code == 200
        )
        
        if response.status_code == 200:
            try:
                user = Student.objects.get(matric_number=matric_number)
                user.last_login_ip = ip_address
                user.failed_login_attempts = 0
                user.locked_until = None
                user.save(update_fields=['last_login_ip', 'failed_login_attempts', 'locked_until'])
                
                self.check_multiple_accounts_per_ip(ip_address)
                
            except Student.DoesNotExist:
                pass
        else:
            self.handle_failed_login(matric_number, ip_address)
        
        return self.response(
            data=response.data, 
            message="Login successful." if response.status_code == 200 else "Login failed.", 
            status_code=response.status_code
        )

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def detect_suspicious_activity(self, ip_address, matric_number):
        one_hour_ago = timezone.now() - timedelta(hours=1)
        failed_attempts = LoginAttempt.objects.filter(
            ip_address=ip_address,
            success=False,
            timestamp__gte=one_hour_ago
        ).count()
        
        if failed_attempts >= 10:
            return True
            
        if matric_number:
            recent_attempts = LoginAttempt.objects.filter(
                ip_address=ip_address,
                timestamp__gte=one_hour_ago
            ).values('matric_number').distinct().count()
            
            if recent_attempts >= 5:
                return True
                
        return False

    def is_account_locked(self, matric_number):
        try:
            user = Student.objects.get(matric_number=matric_number)
            if user.locked_until and user.locked_until > timezone.now():
                return True
        except Student.DoesNotExist:
            pass
        return False

    def handle_failed_login(self, matric_number, ip_address):
        if matric_number:
            try:
                user = Student.objects.get(matric_number=matric_number)
                user.failed_login_attempts += 1
                
                if user.failed_login_attempts >= 5:
                    user.locked_until = timezone.now() + timedelta(hours=1)
                    
                user.save(update_fields=['failed_login_attempts', 'locked_until'])
            except Student.DoesNotExist:
                pass

    def check_multiple_accounts_per_ip(self, ip_address):
        yesterday = timezone.now() - timedelta(days=1)
        unique_users = Student.objects.filter(
            last_login_ip=ip_address,
            last_login__gte=yesterday
        ).count()
        
        if unique_users > 3:
            ip_restriction, created = IPRestriction.objects.get_or_create(
                ip_address=ip_address,
                defaults={'reason': f'Multiple accounts ({unique_users}) detected from same IP'}
            )
            
            logger.warning(f"Multiple accounts detected from IP {ip_address}: {unique_users} users")


class RefreshTokenView(TokenRefreshView, ResponseMixin):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            return self.response(data=response.data, message="Token refreshed successfully.")
        return self.response(data=response.data, message="Token refresh failed.", status_code=response.status_code)
    

class LogoutView(APIView, ResponseMixin):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get("refresh")

            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info(f"User {request.user.matric_number} logged out successfully.")
            return self.response(data={}, message="Logout successful.", status_code=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            logger.error(f"Logout failed for user {request.user.matric_number}: {str(e)}")
            return self.response(error={"detail": "Logout failed."}, status_code=status.HTTP_400_BAD_REQUEST)
        

class CurrentUserView(APIView, ResponseMixin):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = StudentSerializer(user)
        return self.response(data=serializer.data, message="Current user retrieved successfully.")
    

class StudentViewSet(viewsets.ReadOnlyModelViewSet, ResponseMixin):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='qualified-candidates', permission_classes=[AllowAny])
    def qualified_candidates(self, request):
        """
        Returns a list of all students who are eligible to run for positions.
        Optionally filter by gender for specific position.
        """
        queryset = self.queryset.filter(level=500, status='active')
        
        # Optional gender filter
        gender = request.query_params.get('gender')
        if gender and gender in ['male', 'female']:
            queryset = queryset.filter(gender=gender)
            
        serializer = self.get_serializer(queryset, many=True)
        return self.response(data=serializer.data, message="List of all qualified candidates.")

    # ADMIN ONLY ROUTES
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser], parser_classes=[MultiPartParser, FormParser])
    def bulk_import(self, request):
        """
        High‑performance bulk import of students from CSV.
        Expected columns (case‑insensitive):
          matric_number, full_name, level, gender(optional), state_of_origin, email(optional), phone_number(optional), date_of_birth(YYYY-MM-DD optional)

        Optimizations:
          * Single pass read (no full file kept as giant string unless small)
          * Pre-collect matric numbers -> one DB query for existing
          * Cache hashed default passwords per unique state_of_origin
          * bulk_create with batching (no per-row INSERT)
          * Minimal per-row validation & typed casting
        """
        start_time = time.perf_counter()
        try:
            if 'file' not in request.FILES:
                return self.response(error={"detail": "No file provided."}, status_code=400)

            csv_file = request.FILES['file']
            if not csv_file.name.lower().endswith('.csv'):
                return self.response(error={"detail": "File must be a CSV."}, status_code=400)

            # Stream decode to avoid unnecessary copies
            try:
                decoded = io.TextIOWrapper(csv_file.file, encoding='utf-8')
            except Exception:
                decoded = io.StringIO(csv_file.read().decode('utf-8'))

            reader = csv.DictReader(decoded)
            rows = list(reader)
            total_rows = len(rows)
            if total_rows == 0:
                return self.response(data={'created_count': 0, 'errors': []}, message="Empty CSV provided.")

            required_fields = {'matric_number', 'full_name', 'state_of_origin'}
            default_level = int(request.data.get('default_level', 500))
            strict_dates = str(request.data.get('strict_dates', 'false')).lower() in {'1','true','yes'}
            accepted_date_formats = ['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%d.%m.%Y']

            header = {h.lower().strip(): h for h in (reader.fieldnames or [])}
            missing_required = [f for f in required_fields if f not in header]
            if missing_required:
                return self.response(error={"detail": f"Missing required columns: {', '.join(missing_required)}"}, status_code=400)

            matric_numbers = []
            normalized_rows = []
            errors = []

            for idx, raw in enumerate(rows, start=2):
                try:
                    norm = {k.lower().strip(): (v.strip() if isinstance(v, str) else v) for k, v in raw.items()}
                    missing = [f for f in required_fields if not norm.get(f)]
                    if missing:
                        errors.append(f"Row {idx}: Missing required field(s): {', '.join(missing)}")
                        continue
                    matric = norm['matric_number'].upper()
                    norm['matric_number'] = matric
                    level_raw = norm.get('level')
                    if level_raw:
                        try:
                            norm['level'] = int(level_raw)
                        except ValueError:
                            errors.append(f"Row {idx}: Invalid level '{level_raw}' -> using default {default_level}")
                            norm['level'] = default_level
                    else:
                        norm['level'] = default_level
                    gender = (norm.get('gender') or 'other').lower()
                    if gender not in {'male', 'female', 'other'}:
                        gender = 'other'
                    norm['gender'] = gender
                    dob_raw = norm.get('date_of_birth') or ''
                    dob_val = None
                    if dob_raw:
                        parsed = False
                        for fmt in accepted_date_formats:
                            try:
                                dob_val = datetime.strptime(dob_raw, fmt).date()
                                parsed = True
                                break
                            except ValueError:
                                continue
                        if not parsed:
                            msg = f"Row {idx}: Unrecognized date_of_birth '{dob_raw}' (accepted: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY)"
                            if strict_dates:
                                errors.append(msg)
                                continue
                            else:
                                errors.append(msg + ' -> stored as NULL')
                                dob_val = None
                    norm['date_of_birth'] = dob_val
                    normalized_rows.append((idx, norm))
                    matric_numbers.append(matric)
                except Exception as e:
                    errors.append(f"Row {idx}: {str(e)}")

            if not normalized_rows:
                elapsed = time.perf_counter() - start_time
                return self.response(data={'created_count': 0, 'errors': errors[:25], 'time_seconds': round(elapsed,3)}, message="No valid rows to import.")

            existing_set = set(
                Student.objects.filter(matric_number__in=matric_numbers).values_list('matric_number', flat=True)
            )

            to_create = []
            hashed_cache = {}
            default_password_fallback = make_password('password123')

            for idx, norm in normalized_rows:
                if norm['matric_number'] in existing_set:
                    errors.append(f"Row {idx}: Student {norm['matric_number']} already exists")
                    continue
                state = norm.get('state_of_origin') or 'password123'
                if state not in hashed_cache:
                    hashed_cache[state] = make_password(state)
                pwd = hashed_cache.get(state, default_password_fallback)
                to_create.append(Student(
                    matric_number=norm['matric_number'],
                    full_name=norm['full_name'],
                    level=norm['level'],
                    gender=norm['gender'],
                    state_of_origin=norm.get('state_of_origin') or '',
                    email=(norm.get('email') or None) or None,
                    phone_number=(norm.get('phone_number') or None) or None,
                    password=pwd,
                    date_of_birth=norm['date_of_birth'],
                ))

            created_count = 0
            if to_create:
                try:
                    with transaction.atomic():
                        Student.objects.bulk_create(to_create, batch_size=1000)
                    created_count = len(to_create)
                except Exception as e:
                    logger.error(f"Bulk create failed: {str(e)}")
                    errors.append(f"Bulk create failed: {str(e)}")

            elapsed = time.perf_counter() - start_time
            return self.response(
                data={
                    'created_count': created_count,
                    'skipped': total_rows - created_count,
                    'errors': errors[:25],
                    'time_seconds': round(elapsed, 3),
                    'avg_ms_per_created': round((elapsed / created_count * 1000), 2) if created_count else None
                },
                message=f"Import completed: {created_count} created, {len(errors)} issues."
            )
        except Exception as e:
            logger.error(f"Bulk import fatal error: {str(e)}")
            return self.response(error={"detail": "Import failed."}, status_code=500)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def export(self, request):
        """
        Export students to CSV.
        """
        try:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="students_{timezone.now().strftime("%Y%m%d")}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Matric Number', 'Full Name', 'Level', 'Gender', 'State of Origin', 'Email', 'Phone', 'Status', 'Date Joined'])
            
            for student in self.queryset.all():
                writer.writerow([
                    student.matric_number,
                    student.full_name,
                    student.level,
                    student.gender,
                    student.state_of_origin,
                    student.email or '',
                    student.phone_number or '',
                    student.status,
                    student.date_joined.strftime('%Y-%m-%d')
                ])
            
            return response
            
        except Exception as e:
            logger.error(f"Export failed: {str(e)}")
            return self.response(error={"detail": "Export failed."}, status_code=500)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reset_password(self, request, pk=None):
        """
        Reset student password to default.
        """
        try:
            student = self.get_object()
            new_password = request.data.get('new_password', 'password123')
            student.set_password(new_password)
            student.save()
            
            return self.response(
                data={'matric_number': student.matric_number},
                message="Password reset successfully."
            )
            
        except Exception as e:
            logger.error(f"Password reset failed: {str(e)}")
            return self.response(error={"detail": "Password reset failed."}, status_code=500)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def toggle_status(self, request, pk=None):
        """
        Toggle student active/inactive status.
        """
        try:
            student = self.get_object()
            student.is_active = not student.is_active
            student.save()
            
            return self.response(
                data={'is_active': student.is_active},
                message=f"Student {'activated' if student.is_active else 'deactivated'} successfully."
            )
            
        except Exception as e:
            logger.error(f"Status toggle failed: {str(e)}")
            return self.response(error={"detail": "Status toggle failed."}, status_code=500)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def analytics(self, request):
        """
        Get student analytics for admin dashboard.
        """
        try:
            total_students = self.queryset.count()
            active_students = self.queryset.filter(is_active=True).count()
            candidates = self.queryset.filter(level=500, status='active').count()
            
            level_distribution = self.queryset.values('level').annotate(count=Count('id')).order_by('level')
            gender_distribution = self.queryset.values('gender').annotate(count=Count('id'))
            status_distribution = self.queryset.values('status').annotate(count=Count('id'))
            
            return self.response(
                data={
                    'totals': {
                        'total_students': total_students,
                        'active_students': active_students,
                        'eligible_candidates': candidates
                    },
                    'distributions': {
                        'by_level': list(level_distribution),
                        'by_gender': list(gender_distribution),
                        'by_status': list(status_distribution)
                    }
                },
                message="Student analytics retrieved successfully."
            )
            
        except Exception as e:
            logger.error(f"Analytics failed: {str(e)}")
            return self.response(error={"detail": "Analytics retrieval failed."}, status_code=500)
        

class ElectionViewSet(viewsets.ModelViewSet, ResponseMixin):  # Changed from ReadOnlyModelViewSet
    queryset = Election.objects.all().order_by('-start_date')
    serializer_class = ActiveElectionSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        """
        Override permissions for different actions
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'toggle_status']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """
        Create a new election (Admin only)
        """
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return self.response(
                data=serializer.data,
                message="Election created successfully.",
                status_code=201
            )
        except Exception as e:
            logger.error(f"Election creation failed: {str(e)}")
            return self.response(error={"detail": "Election creation failed."}, status_code=500)

    def update(self, request, *args, **kwargs):
        """
        Update an election (Admin only)
        """
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return self.response(
                data=serializer.data,
                message="Election updated successfully."
            )
        except Exception as e:
            logger.error(f"Election update failed: {str(e)}")
            return self.response(error={"detail": "Election update failed."}, status_code=500)

    def destroy(self, request, *args, **kwargs):
        """
        Delete an election (Admin only)
        """
        try:
            instance = self.get_object()
            # Check if election has votes before deleting
            if Vote.objects.filter(position__election=instance).exists():
                return self.response(
                    error={"detail": "Cannot delete election with existing votes."},
                    status_code=400
                )
            self.perform_destroy(instance)
            return self.response(
                message="Election deleted successfully.",
                status_code=204
            )
        except Exception as e:
            logger.error(f"Election deletion failed: {str(e)}")
            return self.response(error={"detail": "Election deletion failed."}, status_code=500)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def toggle_status(self, request, pk=None):
        """
        Toggle election active/inactive status (Admin only)
        """
        try:
            election = self.get_object()
            
            # If activating, deactivate all other elections first
            if not election.is_active:
                Election.objects.filter(is_active=True).update(is_active=False)
            
            election.is_active = not election.is_active
            election.save()
            
            return self.response(
                data={'is_active': election.is_active},
                message=f"Election {'activated' if election.is_active else 'deactivated'} successfully.",
                status_code=200
            )
        except Exception as e:
            logger.error(f"Election status toggle failed: {str(e)}")
            return self.response(error={"detail": "Status toggle failed."}, status_code=500)

    def list(self, request, *args, **kwargs):
        """
        Returns a list of all elections.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return self.response(data=serializer.data, message="List of all elections retrieved successfully.")

    def retrieve(self, request, *args, **kwargs):
        """
        Returns details of a specific election.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return self.response(data=serializer.data, message="Election details retrieved successfully.")

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

    @action(detail=True, methods=['get'], url_path='results', permission_classes=[IsAuthenticated])
    def results(self, request, pk=None):
        election = self.get_object()
        if election.end_date > timezone.now() and not request.user.is_staff:
            return self.response(error={"detail": "Results not available until the election ends."}, status_code=403)

        vote_data = Vote.objects.filter(position__election=election) \
            .select_related('student_voted_for') \
            .values('position__id', 'position__name', 'student_voted_for__id', 'student_voted_for__full_name') \
            .annotate(vote_count=Count('id')).order_by('position__name', '-vote_count')

        grouped = {}
        for vote in vote_data:
            pid = vote['position__id']
            
            # Get the actual student object to access the picture URL properly
            student = Student.objects.get(id=vote['student_voted_for__id'])
            picture_url = student.picture.url if student.picture else None
            
            grouped.setdefault(pid, {
            'position_id': pid,
            'position_name': vote['position__name'],
            'candidates': []
            })['candidates'].append({
            'student_id': vote['student_voted_for__id'],
            'student_name': vote['student_voted_for__full_name'],
            'picture': picture_url,
            'vote_count': vote['vote_count']
            })

        election_data = self.get_serializer(election).data
        election_data['results'] = list(grouped.values())
        
        return self.response(data=election_data, message="Election results retrieved successfully.")
    
    @action(detail=False, methods=['get'], url_path='recent-winners')
    def recent_winners(self, request):
        """
        Returns recent winners from concluded elections for the showcase.
        """
        try:
            # Get the most recent concluded elections
            concluded_elections = Election.objects.filter(
                end_date__lt=timezone.now()
            ).order_by('-end_date')[:3]  # Last 3 elections
            
            winners_data = []
            
            for election in concluded_elections:
                # Get winners (top vote getters) from each position
                vote_data = Vote.objects.filter(position__election=election) \
                    .select_related('student_voted_for', 'position') \
                    .values('position__id', 'position__name', 'student_voted_for__id', 'student_voted_for__full_name') \
                    .annotate(vote_count=Count('id')).order_by('position__name', '-vote_count')
                
                # Group by position and get the top candidate for each position
                position_winners = {}
                for vote in vote_data:
                    pid = vote['position__id']
                    if pid not in position_winners:
                        student = Student.objects.get(id=vote['student_voted_for__id'])
                        picture_url = student.picture.url if student.picture else None
                        
                        position_winners[pid] = {
                            'position_name': vote['position__name'],
                            'winner_name': vote['student_voted_for__full_name'],
                            'winner_picture': picture_url,
                            'vote_count': vote['vote_count'],
                            'election_name': election.name,
                            'election_year': election.end_date.year
                        }
                
                # Add position winners to the showcase
                for winner in position_winners.values():
                    winners_data.append(winner)
            
            # Limit to 8 most recent winners for the showcase
            winners_data = winners_data[:8]
            
            return self.response(data=winners_data, message="Recent winners retrieved successfully.") 
        except Exception as e:
            logger.error(f"Error retrieving recent winners: {str(e)}")
            return self.response(error={"detail": "An error occurred while retrieving recent winners."}, status_code=500)  
             
    @action(detail=False, methods=['get'], url_path='last-concluded')
    def last_concluded_election(self, request):
        """
        Returns the most recently concluded election with its results.
        """
        try:
            concluded_election = Election.objects.filter(
                end_date__lt=timezone.now()
            ).order_by('-end_date').first()
            
            if not concluded_election:
                return self.response(error={"detail": "No concluded election found."}, status_code=404)
            
            # Get results for the concluded election
            vote_data = Vote.objects.filter(position__election=concluded_election) \
                .select_related('student_voted_for') \
                .values('position__id', 'position__name', 'student_voted_for__id', 'student_voted_for__full_name') \
                .annotate(vote_count=Count('id')).order_by('position__name', '-vote_count')

            grouped = {}
            for vote in vote_data:
                pid = vote['position__id']
                
                # Get the actual student object to access the picture URL properly
                student = Student.objects.get(id=vote['student_voted_for__id'])
                picture_url = student.picture.url if student.picture else None
                
                grouped.setdefault(pid, {
                    'position_id': pid,
                    'position_name': vote['position__name'],
                    'candidates': []
                })['candidates'].append({
                    'student_id': vote['student_voted_for__id'],
                    'student_name': vote['student_voted_for__full_name'],
                    'picture': picture_url,
                    'vote_count': vote['vote_count']
                })

            election_data = self.get_serializer(concluded_election).data
            election_data['results'] = list(grouped.values())
            
            return self.response(data=election_data, message="Last concluded election results retrieved successfully.")
            
        except Exception as e:
            logger.error(f"Error retrieving last concluded election: {str(e)}")
            return self.response(error={"detail": "An error occurred while retrieving the election results."}, status_code=500)


class PositionViewSet(viewsets.ReadOnlyModelViewSet, ResponseMixin):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'], url_path='candidates')
    def candidates(self, request, pk=None):
        position = self.get_object()
        students = position.get_eligible_candidates()
        context = self.get_serializer_context()
        context['position'] = position
        serializer = DynamicCandidateSerializer(students, many=True, context=context)
        return self.response(data=serializer.data, message="Candidates for position retrieved successfully.")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data['candidate_count'] = instance.get_eligible_candidates().count()
        return self.response(data=data, message="Position details retrieved successfully.")

    # ADMIN ONLY ROUTES
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def bulk_create(self, request):
        """
        Create multiple positions for an election.
        """
        try:
            election_id = request.data.get('election_id')
            positions_data = request.data.get('positions', [])
            
            if not election_id:
                return self.response(error={"detail": "Election ID is required."}, status_code=400)
            
            election = Election.objects.get(id=election_id)
            created_positions = []
            
            for position_data in positions_data:
                position = Position.objects.create(
                    name=position_data['name'],
                    election=election,
                    gender_restriction=position_data.get('gender_restriction', 'any'),
                    position_type=position_data.get('position_type', 'senior'),
                )
                created_positions.append(position)
            
            serializer = self.get_serializer(created_positions, many=True)
            return self.response(
                data=serializer.data,
                message=f"{len(created_positions)} positions created successfully.",
                status_code=201
            )
            
        except Election.DoesNotExist:
            return self.response(error={"detail": "Election not found."}, status_code=404)
        except Exception as e:
            logger.error(f"Bulk position creation failed: {str(e)}")
            return self.response(error={"detail": "Position creation failed."}, status_code=500)

    @action(detail=True, methods=['get'], permission_classes=[IsAdminUser])
    def vote_analytics(self, request, pk=None):
        """
        Get detailed voting analytics for a position.
        """
        try:
            position = self.get_object()
            
            # Vote breakdown by candidate
            vote_breakdown = Vote.objects.filter(position=position) \
                .select_related('student_voted_for') \
                .values('student_voted_for__full_name', 'student_voted_for__gender') \
                .annotate(vote_count=Count('id')) \
                .order_by('-vote_count')
            
            # Voting timeline (votes per hour during election)
            vote_timeline = Vote.objects.filter(position=position) \
                .extra(select={'hour': "strftime('%%H', voted_at)"}) \
                .values('hour') \
                .annotate(count=Count('id')) \
                .order_by('hour')
            
            # Gender distribution of voters
            voter_gender_dist = Vote.objects.filter(position=position) \
                .values('voter__gender') \
                .annotate(count=Count('id'))
            
            total_votes = Vote.objects.filter(position=position).count()
            eligible_voters = Student.objects.filter(level=500, status='active').count()
            
            # If no gender restriction, use all 500L active students
            if position.gender_restriction != 'any':
                eligible_voters = Student.objects.filter(
                    level=500, 
                    status='active', 
                    gender=position.gender_restriction
                ).count()
            
            # Determine eligible voters by election type + gender
            if position.election.type == 'specific':
                base = Student.objects.filter(level=500, status='active')
            else:
                base = Student.objects.filter(status='active')
            if position.gender_restriction != 'any':
                base = base.filter(gender=position.gender_restriction)
            eligible_voters = base.count()
            
            return self.response(
                data={
                    'position_name': position.name,
                    'total_votes': total_votes,
                    'eligible_voters': eligible_voters,
                    'participation_rate': (total_votes / eligible_voters * 100) if eligible_voters > 0 else 0,
                    'vote_breakdown': list(vote_breakdown),
                    'vote_timeline': list(vote_timeline),
                    'voter_demographics': list(voter_gender_dist)
                },
                message="Position analytics retrieved successfully."
            )
            
        except Exception as e:
            logger.error(f"Position analytics failed: {str(e)}")
            return self.response(error={"detail": "Analytics retrieval failed."}, status_code=500)
        

class VoteViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin, ResponseMixin):
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer(self, *args, **kwargs):
        serializer = super().get_serializer(*args, **kwargs)
        # Update queryset for student_voted_for based on position
        if hasattr(serializer, 'initial_data') and 'position' in serializer.initial_data:
            try:
                position = Position.objects.get(id=serializer.initial_data['position'])
                serializer.fields['student_voted_for'].queryset = position.get_eligible_candidates()
            except Position.DoesNotExist:
                pass
        return serializer

    def create(self, request, *args, **kwargs):
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        security_check = self.perform_security_checks(request.user, ip_address)
        if security_check['blocked']:
            return self.response(
                data={}, 
                message=security_check['reason'], 
                status_code=403
            )
        
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            
            from .models import VoteAttempt
            VoteAttempt.objects.create(
                voter=request.user,
                ip_address=ip_address,
                position=serializer.validated_data['position'],
                success=True,
                user_agent=user_agent
            )
            
            self.perform_create(serializer)
            
            return self.response(
                data=serializer.data, 
                message="Vote cast successfully.", 
                status_code=201
            )
            
        except ValidationError as e:
            # Log failed vote attempt
            position = request.data.get('position')
            if position:
                try:
                    from .models import VoteAttempt
                    position_obj = Position.objects.get(id=position)
                    VoteAttempt.objects.create(
                        voter=request.user,
                        ip_address=ip_address,
                        position=position_obj,
                        success=False,
                        reason=str(e),
                        user_agent=user_agent
                    )
                except Position.DoesNotExist:
                    pass
            
            return self.response(data={}, message=str(e), status_code=400)
        except Exception as e:
            logger.error(f"Voting error for user {request.user.matric_number}: {str(e)}")
            return self.response(data={}, message="An error occurred while processing your vote.", status_code=500)

    def perform_security_checks(self, user, ip_address):
        """Perform comprehensive security checks before allowing vote."""
        if user.last_login_ip and user.last_login_ip != ip_address:
            if not self.is_same_network(user.last_login_ip, ip_address):
                recent_votes = Vote.objects.filter(
                    voter=user,
                    voted_at__gte=timezone.now() - timedelta(minutes=30)
                ).exists()
                
                if recent_votes:
                    return {
                        'blocked': True,
                        'reason': 'Suspicious IP change detected during voting session.'
                    }
        
        recent_votes_count = Vote.objects.filter(
            voter=user,
            voted_at__gte=timezone.now() - timedelta(seconds=20)
        ).count()
        
        if recent_votes_count >= 3:
            return {
                'blocked': True,
                'reason': 'Voting too quickly. Please slow down.'
            }
        
        current_hour = timezone.now().hour
        if hasattr(settings, 'VOTING_ALLOWED_HOURS'):
            allowed_hours = getattr(settings, 'VOTING_ALLOWED_HOURS', range(6, 22))  # 6 AM to 10 PM default
            if current_hour not in allowed_hours:
                return {
                    'blocked': True,
                    'reason': 'Voting is only allowed during designated hours.'
                }
        
        return {'blocked': False, 'reason': ''}

    def is_same_network(self, ip1, ip2):
        """Check if two IPs are in the same /24 network (basic check)."""
        try:
            return '.'.join(ip1.split('.')[:3]) == '.'.join(ip2.split('.')[:3])
        except:
            return False

    def get_client_ip(self, request):
        """Extract the real client IP address from request headers."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def perform_create(self, serializer):
        from typing import cast
        voter = cast(Student, self.request.user)
        position = serializer.validated_data['position']
        # double check voter eligibility for safety
        if position.election.type == 'specific' and voter.level != 500:
            raise ValidationError("You are not eligible to vote in this specific election.")
        if voter.status != 'active':
            raise ValidationError("Inactive users cannot vote.")
        if Vote.objects.filter(voter=voter, position=position).exists():
            raise ValidationError("You have already voted for this position.")
        serializer.save(voter=voter)

    # ADMIN ONLY ROUTES
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def voting_logs(self, request):
        """
        Get comprehensive voting logs with filters.
        """
        try:
            queryset = self.queryset.select_related('voter', 'student_voted_for', 'position', 'position__election')
            
            # Apply filters
            election_id = request.query_params.get('election')
            position_id = request.query_params.get('position')
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            
            if election_id:
                queryset = queryset.filter(position__election_id=election_id)
            if position_id:
                queryset = queryset.filter(position_id=position_id)
            if date_from:
                queryset = queryset.filter(voted_at__date__gte=date_from)
            if date_to:
                queryset = queryset.filter(voted_at__date__lte=date_to)
            
            # Pagination
            page_size = int(request.query_params.get('page_size', 50))
            page = int(request.query_params.get('page', 1))
            start = (page - 1) * page_size
            end = start + page_size
            
            total_count = queryset.count()
            votes = queryset[start:end]
            
            vote_data = []
            for vote in votes:
                vote_data.append({
                    'id': vote.id,
                    'voter_name': vote.voter.full_name,
                    'voter_matric': vote.voter.matric_number,
                    'candidate_name': vote.student_voted_for.full_name,
                    'candidate_matric': vote.student_voted_for.matric_number,
                    'position': vote.position.name,
                    'election': vote.position.election.name,
                    'voted_at': vote.voted_at,
                })
            
            return self.response(
                data=vote_data,
                count=total_count,
                message="Voting logs retrieved successfully."
            )
            
        except Exception as e:
            logger.error(f"Voting logs failed: {str(e)}")
            return self.response(error={"detail": "Voting logs retrieval failed."}, status_code=500)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def export_votes(self, request):
        """
        Export all votes to CSV.
        """
        try:
            queryset = self.queryset.select_related('voter', 'student_voted_for', 'position', 'position__election')
            
            # Apply same filters as voting_logs
            election_id = request.query_params.get('election')
            if election_id:
                queryset = queryset.filter(position__election_id=election_id)
            
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="votes_{timezone.now().strftime("%Y%m%d")}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Voter Name', 'Voter Matric', 'Candidate Name', 'Candidate Matric', 'Position', 'Election', 'Vote Time'])
            
            for vote in queryset:
                writer.writerow([
                    vote.voter.full_name,
                    vote.voter.matric_number,
                    vote.student_voted_for.full_name,
                    vote.student_voted_for.matric_number,
                    vote.position.name,
                    vote.position.election.name,
                    vote.voted_at.strftime('%Y-%m-%d %H:%M:%S')
                ])
            
            return response
            
        except Exception as e:
            logger.error(f"Vote export failed: {str(e)}")
            return self.response(error={"detail": "Vote export failed."}, status_code=500)
        

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

        try:
            position = Position.objects.get(id=position_id)
            # Check if student is eligible for this position
            if student not in position.get_eligible_candidates():
                gender_msg = ""
                if position.gender_restriction != 'any':
                    gender_msg = f" This position is restricted to {position.gender_restriction} candidates only."
                return self.response(
                    error={"detail": f"You are not eligible for this position.{gender_msg}"}, 
                    status_code=400
                )
        except Position.DoesNotExist:
            return self.response(error={"detail": "Position not found."}, status_code=404)

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
        
        # Optional gender filter
        gender = request.query_params.get('gender')
        if gender and gender in ['male', 'female']:
            queryset = queryset.filter(student__gender=gender)
            
        serializer = self.get_serializer(queryset, many=True)
        return self.response(data=serializer.data, message="List of all qualified candidates.")

    # ADMIN ONLY ROUTES
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def moderation_queue(self, request):
        """
        Get candidates that need moderation (with incomplete profiles).
        """
        try:
            # Candidates with missing bio or photo
            incomplete_candidates = self.queryset.filter(
                Q(bio__isnull=True) | Q(bio='') | Q(photo__isnull=True)
            ).select_related('student', 'position', 'position__election')
            
            candidate_data = []
            for candidate in incomplete_candidates:
                candidate_data.append({
                    'id': candidate.id,
                    'student_name': candidate.student.full_name,
                    'student_matric': candidate.student.matric_number,
                    'position': candidate.position.name,
                    'election': candidate.position.election.name,
                    'missing_bio': not candidate.bio,
                    'missing_photo': not candidate.photo,
                    'created_at': candidate.created_at
                })
            
            return self.response(
                data=candidate_data,
                message="Moderation queue retrieved successfully."
            )
            
        except Exception as e:
            logger.error(f"Moderation queue failed: {str(e)}")
            return self.response(error={"detail": "Moderation queue retrieval failed."}, status_code=500)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def statistics(self, request):
        """
        Get candidate statistics across all elections.
        """
        try:
            total_candidates = self.queryset.count()
            
            # By election
            by_election = self.queryset.values('position__election__name') \
                .annotate(count=Count('id')) \
                .order_by('-count')
            
            # By position
            by_position = self.queryset.values('position__name') \
                .annotate(count=Count('id')) \
                .order_by('-count')
            
            # By gender
            by_gender = self.queryset.values('student__gender') \
                .annotate(count=Count('id'))
            
            # Completion rate
            complete_profiles = self.queryset.filter(
                bio__isnull=False, photo__isnull=False
            ).exclude(bio='').count()
            
            completion_rate = (complete_profiles / total_candidates * 100) if total_candidates > 0 else 0
            
            return self.response(
                data={
                    'total_candidates': total_candidates,
                    'complete_profiles': complete_profiles,
                    'completion_rate': round(completion_rate, 2),
                    'distribution': {
                        'by_election': list(by_election),
                        'by_position': list(by_position),
                        'by_gender': list(by_gender)
                    }
                },
                message="Candidate statistics retrieved successfully."
            )
            
        except Exception as e:
            logger.error(f"Candidate statistics failed: {str(e)}")
            return self.response(error={"detail": "Statistics retrieval failed."}, status_code=500)

# ADMIN DASHBOARD VIEW
class AdminDashboardView(APIView, ResponseMixin):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """
        Get comprehensive admin dashboard data.
        """
        try:
            # System overview
            total_students = Student.objects.count()
            active_students = Student.objects.filter(is_active=True).count()
            total_elections = Election.objects.count()
            active_elections = Election.objects.filter(is_active=True).count()
            total_votes = Vote.objects.count()
            
            # Recent activity (last 7 days)
            from datetime import timedelta
            week_ago = timezone.now() - timedelta(days=7)
            
            recent_votes = Vote.objects.filter(voted_at__gte=week_ago).count()
            recent_students = Student.objects.filter(date_joined__gte=week_ago).count()
            recent_candidates = Candidate.objects.filter(created_at__gte=week_ago).count()
            
            # Current election status
            current_election = Election.objects.filter(is_active=True).first()
            current_election_data = None
            
            if current_election:
                election_votes = Vote.objects.filter(position__election=current_election).count()
                if current_election.type == 'specific':
                    voter_pool = Student.objects.filter(level=500, status='active')
                else:
                    voter_pool = Student.objects.filter(status='active')
                eligible_voters = voter_pool.count()
                positions_count = Position.objects.filter(election=current_election).count()
                
                participation_rate = 0
                if eligible_voters > 0 and positions_count > 0:
                    participation_rate = (election_votes / (eligible_voters * positions_count)) * 100
                
                current_election_data = {
                    'id': current_election.id,
                    'name': current_election.name,
                    'start_date': current_election.start_date,
                    'end_date': current_election.end_date,
                    'positions_count': positions_count,
                    'total_votes': election_votes,
                    'eligible_voters': eligible_voters,
                    'participation_rate': round(participation_rate, 2)
                }
            
            dashboard_data = {
                'overview': {
                    'total_students': total_students,
                    'active_students': active_students,
                    'total_elections': total_elections,
                    'active_elections': active_elections,
                    'total_votes': total_votes
                },
                'recent_activity': {
                    'new_votes': recent_votes,
                    'new_students': recent_students,
                    'new_candidates': recent_candidates
                },
                'current_election': current_election_data
            }
            
            return self.response(
                data=dashboard_data,
                message="Admin dashboard data retrieved successfully."
            )
            
        except Exception as e:
            logger.error(f"Admin dashboard failed: {str(e)}")
            return self.response(error={"detail": "Dashboard data retrieval failed."}, status_code=500)


class ChangePasswordView(APIView, ResponseMixin):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=False)
            if serializer.errors:
                flat_errors = []
                errors_data = serializer.errors
                if isinstance(errors_data, dict):
                    iterable = errors_data.items()
                else:
                    iterable = [("non_field_errors", msg) for msg in errors_data]
                for field, messages in iterable:
                    if isinstance(messages, (list, tuple)):
                        for m in messages:
                            flat_errors.append(f"{field}: {m}")
                    else:
                        flat_errors.append(f"{field}: {messages}")
                primary_message = flat_errors[0] if flat_errors else "Invalid data."
                return self.response(
                    data={"errors": flat_errors},
                    message=primary_message,
                    status_code=400
                )
            serializer.save()
            return self.response(data={}, message="Password changed successfully.")
        except Exception:
            logger.exception("Password change failed.")
            return self.response(
                error={"detail": "Unable to change password at this time."},
                status_code=500
            )
    