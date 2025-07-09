from django.utils import timezone
from django.core.cache import cache
from datetime import timedelta
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer as DefaultTokenObtainPairSerializer

from .models import Student, Election, Position, Candidate, Vote


class TokenObtainPairSerializer(DefaultTokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['matric_number'] = user.matric_number
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):        
        if attrs.get('matric_number'):
            attrs['matric_number'] = attrs['matric_number'].upper()
        return super().validate(attrs)


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id', 'matric_number', 'full_name', 'level', 'state_of_origin', 
            'email', 'phone_number', 'picture', 'status', 'is_active', 'date_joined',
            'is_staff', 'is_superuser', 'is_verified', 'is_nominated'
        ]
        read_only_fields = ['is_active', 'date_joined', 'is_staff', 'is_superuser', 'is_verified', 'is_nominated']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.picture and self.context.get('request'):
            data['picture'] = self.context['request'].build_absolute_uri(instance.picture.url)
        return data

class DynamicCandidateSerializer(serializers.ModelSerializer):
    bio = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'full_name', 'picture', 'bio', 'photo']

    def get_bio(self, obj):
        enhancement = self._get_enhancement(obj)
        return enhancement.bio if enhancement else ""

    def get_photo(self, obj):
        enhancement = self._get_enhancement(obj)
        request = self.context.get('request')
        if not request:
            return None
        if enhancement and enhancement.photo:
            return request.build_absolute_uri(enhancement.photo.url)
        elif obj.picture:
            return request.build_absolute_uri(obj.picture.url)
        return None
    def _get_enhancement(self, student):
        position = self.context.get('position')
        if not position:
            return None
        return Candidate.objects.filter(student=student, position=position).first()


class PositionSerializer(serializers.ModelSerializer):
    candidates = serializers.SerializerMethodField()
    candidate_count = serializers.SerializerMethodField()
    vote_count = serializers.SerializerMethodField()
    election_name = serializers.CharField(source='election.name', read_only=True)
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Position
        fields = ['id', 'name', 'candidate_count', 'vote_count', 'election_name', 'candidates', 'has_voted', 'gender_restriction', 'election', 'position_type']

    def get_candidate_count(self, position):
        return position.get_eligible_candidates().count()

    def get_vote_count(self, position):
        return position.votes.count()

    def get_candidates(self, position):
        # Only return candidates when fetching position detail (single instance)
        if self.context.get('view') and hasattr(self.context['view'], 'action'):
            if self.context['view'].action == 'retrieve':
                students = position.get_eligible_candidates()
                context = self.context.copy()
                context['position'] = position
                return DynamicCandidateSerializer(students, many=True, context=context).data
        return None

    def get_has_voted(self, position):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Vote.objects.filter(voter=request.user, position=position).exists()
        return False


class ActiveElectionSerializer(serializers.ModelSerializer):
    positions = PositionSerializer(many=True, read_only=True)

    class Meta:
        model = Election
        fields = ['id', 'name', 'start_date', 'end_date', 'positions', 'is_active']


class CandidateStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['full_name', 'picture']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.picture:
            data['picture'] = self.context['request'].build_absolute_uri(instance.picture.url)
        return data

class CandidateSerializer(serializers.ModelSerializer):
    student = CandidateStudentSerializer(read_only=True)

    class Meta:
        model = Candidate
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.photo and self.context.get('request'):
            data['photo'] = self.context['request'].build_absolute_uri(instance.photo.url)
        return data


class VoteSerializer(serializers.ModelSerializer):
    voter = serializers.PrimaryKeyRelatedField(read_only=True)
    student_voted_for = serializers.PrimaryKeyRelatedField(queryset=Student.objects.none())

    class Meta:
        model = Vote
        fields = ['id', 'voter', 'position', 'student_voted_for']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'data' in kwargs and 'position' in kwargs['data']:
            try:
                position = Position.objects.get(id=kwargs['data']['position'])
                self.fields['student_voted_for'].queryset = position.get_eligible_candidates()
            except Position.DoesNotExist:
                pass

    def validate(self, data):
        position = data.get('position')
        candidate = data.get('student_voted_for')
        request = self.context.get('request')

        if not position.election.is_active or not (position.election.start_date <= timezone.now() <= position.election.end_date):
            raise serializers.ValidationError("This election is not currently active.")

        if request and Vote.objects.filter(voter=request.user, position=position).exists():
            raise serializers.ValidationError("You have already voted for this position.")

        eligible_candidates = position.get_eligible_candidates()
        if candidate not in eligible_candidates:
            gender_msg = ""
            if position.gender_restriction != 'any':
                gender_msg = f" This position is restricted to {position.gender_restriction} candidates only."
            raise serializers.ValidationError(f"{candidate.full_name} is not eligible for this position.{gender_msg}")

        if request:
            self.validate_voting_pattern(request.user, position)

        return data

    def validate_voting_pattern(self, user, position):
        """Check for suspicious voting patterns."""
        cache_key = f"last_vote_{user.id}"
        last_vote_time = cache.get(cache_key)
        
        if last_vote_time:
            time_diff = timezone.now() - last_vote_time
            if time_diff < timedelta(seconds=10):
                raise serializers.ValidationError("Please wait a moment before voting again.")
        
        cache.set(cache_key, timezone.now(), 60)  # Cache for 1 minute
        
        recent_votes = Vote.objects.filter(
            voter=user,
            voted_at__gte=timezone.now() - timedelta(seconds=20)
        ).count()
        
        if recent_votes >= 2:
            raise serializers.ValidationError("You are voting too quickly. Please take your time to consider each position.")
        
        if hasattr(self, 'initial_data') and self.initial_data and isinstance(self.initial_data, dict):
            candidate_id = self.initial_data.get('student_voted_for')
            if candidate_id:
                same_candidate_votes = Vote.objects.filter(
                    voter=user,
                    student_voted_for_id=candidate_id,
                    voted_at__gte=timezone.now() - timedelta(minutes=5)
                ).count()
                
                if same_candidate_votes >= 2:
                    # This might be legitimate if the candidate is running for multiple positions
                    # but we log it for monitoring
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.info(f"User {user.matric_number} voting for same candidate {candidate_id} multiple times")
