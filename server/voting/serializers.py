from django.utils import timezone
from django.core.cache import cache
from datetime import timedelta
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer as DefaultTokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
import logging

from .models import Student, Election, Position, Candidate, Vote

logger = logging.getLogger(__name__)


class TokenObtainPairSerializer(DefaultTokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['matric_number'] = user.matric_number
        token['full_name'] = user.full_name
        token['has_changed_password'] = user.has_changed_password
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
            'date_of_birth', 'email', 'phone_number', 'picture', 'status',
            'is_active', 'date_joined', 'is_staff', 'is_superuser',
            'is_verified', 'has_changed_password'
        ]
        read_only_fields = ['is_active', 'date_joined', 'is_staff', 'is_superuser', 'is_verified', 'has_changed_password']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request:
            if instance.picture:
                data['picture'] = request.build_absolute_uri(instance.picture.url)
            else:
                candidate = (
                    Candidate.objects
                    .filter(student=instance, photo__isnull=False)
                    .order_by('-updated_at')
                    .first()
                )
                if candidate and candidate.photo:
                    data['picture'] = request.build_absolute_uri(candidate.photo.url)
        return data

class DynamicCandidateSerializer(serializers.ModelSerializer):
    bio = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()
    alias = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'full_name', 'picture', 'bio', 'photo', 'alias']

    def get_bio(self, obj):
        enhancement = self._get_enhancement(obj)
        return enhancement.bio if enhancement else ""
    
    def get_alias(self, obj):
        enhancement = self._get_enhancement(obj)
        return enhancement.alias if enhancement else ""

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
        # Only return nominated students when retrieving a single position
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
        fields = ['id', 'name', 'start_date', 'end_date', 'positions', 'is_active', 'type']  # added type


class CandidateStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['full_name', 'picture', 'date_of_birth']  # include if needed (or remove date_of_birth if sensitive)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.picture:
            data['picture'] = self.context['request'].build_absolute_uri(instance.picture.url)
        return data

class CandidateSerializer(serializers.ModelSerializer):
    student = CandidateStudentSerializer(read_only=True)
    position = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all())
    photo = serializers.ImageField(required=False, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True, max_length=2000)
    alias = serializers.CharField(required=False, allow_blank=True, max_length=100)
    student_id = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), write_only=True, required=False, allow_null=True)

    class Meta:
        model = Candidate
        fields = [
            'id', 'student', 'student_id', 'position', 'bio', 'alias', 'photo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']

    def validate_photo(self, value):
        if value is None:
            return value
        max_mb = 3
        if value.size > max_mb * 1024 * 1024:
            raise serializers.ValidationError(f"Image too large. Max {max_mb}MB allowed.")
        valid_types = {'image/jpeg', 'image/png', 'image/webp'}
        content_type = getattr(value, 'content_type', None)
        if content_type and content_type.lower() not in valid_types:
            raise serializers.ValidationError("Unsupported image type. Use JPEG, PNG or WEBP.")
        return value

    def validate_alias(self, value):
        if value:
            cleaned = value.strip()
            if len(cleaned) < 2 and cleaned != '':
                raise serializers.ValidationError("Alias must be at least 2 characters or left blank.")
            return cleaned
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.method == 'POST':
            # Choose student (admin override possible)
            student = request.user
            override = attrs.get('student_id')
            if override and request.user.is_staff:
                student = override
            position = attrs.get('position')
            if position and Candidate.objects.filter(student=student, position=position).exists():
                raise serializers.ValidationError({"non_field_errors": ["You already have a nomination for this position."]})
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        student = request.user if request and request.user.is_authenticated else None
        override = validated_data.pop('student_id', None)
        if override and request and hasattr(request, 'user') and request.user.is_staff:
            student = override
        if not student:
            raise serializers.ValidationError("Authentication required.")
        validated_data['student'] = student
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Allow removing photo via flag
        remove_photo = False
        request = self.context.get('request')
        if request:
            remove_photo = str(request.data.get('remove_photo', 'false')).lower() in {'1','true','yes'}
        if remove_photo and instance.photo:
            instance.photo.delete(save=False)
            instance.photo = None
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.photo and request:
            data['photo'] = request.build_absolute_uri(instance.photo.url)
        # Add helpful denormalized fields for client display
        data['position_name'] = getattr(instance.position, 'name', None)
        data['election_name'] = getattr(instance.position.election, 'name', None)
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
                # restrict to nominated students (via method)
                self.fields['student_voted_for'].queryset = position.get_eligible_candidates()
            except Position.DoesNotExist:
                pass

    def validate(self, data):
        position = data.get('position')
        candidate = data.get('student_voted_for')
        request = self.context.get('request')

        # Election window
        if not position.election.is_active or not (position.election.start_date <= timezone.now() <= position.election.end_date):
            raise serializers.ValidationError("This election is not currently active.")

        # Voter already voted for this position
        if request and Vote.objects.filter(voter=request.user, position=position).exists():
            raise serializers.ValidationError("You have already voted for this position.")

        # Candidate must be among nominated list
        eligible_students = position.get_eligible_candidates()
        if candidate not in eligible_students:
            raise serializers.ValidationError("Selected student is not nominated for this position.")

        # Voter eligibility by election type
        if request:
            if position.election.type == 'specific' and request.user.level != 500:
                raise serializers.ValidationError("You are not eligible to vote in this specific election.")
            # (Optional) block inactive users
            if request.user.status != 'active':
                raise serializers.ValidationError("Inactive users cannot vote.")

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


class ChangePasswordSerializer(serializers.Serializer):
    matric_number = serializers.CharField()
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    date_of_birth = serializers.DateField()

    def validate(self, attrs):
        matric = attrs.get('matric_number', '').upper()
        attrs['matric_number'] = matric
        logger.info(f"[CHANGE_PASSWORD] Attempt start matric={matric}")

        user = Student.objects.filter(matric_number=matric).first()


        if not user:
            logger.warning(f"[CHANGE_PASSWORD] Matric not found matric={matric}")
            raise serializers.ValidationError("User with this matric number does not exist.")

        # if user.level in { 500 }:
        #     raise serializers.ValidationError("Time elapsed Gee! Please check back again.")
        
        if user.has_changed_password:
            logger.warning(f"[CHANGE_PASSWORD] Attempt to change already changed password matric={matric}")
            raise serializers.ValidationError("Password has already been changed previously.")
        
        if not user.check_password(attrs['old_password']):
            logger.warning(f"[CHANGE_PASSWORD] Old password mismatch matric={matric}")
            raise serializers.ValidationError("Old password incorrect.")
        if attrs['new_password'] != attrs['confirm_password']:
            logger.warning(f"[CHANGE_PASSWORD] Password confirmation mismatch matric={matric}")
            raise serializers.ValidationError("Passwords do not match.")
        if not user.date_of_birth:
            logger.warning(f"[CHANGE_PASSWORD] DOB missing on account matric={matric}")
            raise serializers.ValidationError("Date of birth not set on account.")
        if attrs['date_of_birth'] != user.date_of_birth:
            logger.warning(f"[CHANGE_PASSWORD] DOB mismatch matric={matric}, UserDOB: {user.date_of_birth}, ProvidedDOB: {attrs['date_of_birth']}")
            raise serializers.ValidationError("Date of birth mismatch.")
        try:
            validate_password(attrs['new_password'], user=user)
        except Exception as e:
            logger.warning(f"[CHANGE_PASSWORD] Password validation failed matric={matric} reason={str(e)}")
            raise
        logger.info(f"[CHANGE_PASSWORD] Validation passed matric={matric}")
        return attrs

    def save(self, **kwargs):
        validated = getattr(self, 'validated_data', None) or {}
        matric = validated.get('matric_number', '').upper()
        user = Student.objects.filter(matric_number=matric).first()
        if not user:
            logger.error(f"[CHANGE_PASSWORD] Save called but user missing matric={matric}")
            raise serializers.ValidationError("User with this matric number does not exist.")
        if not isinstance(validated, dict) or not validated:
            logger.error(f"[CHANGE_PASSWORD] Save without validated_data type dict matric={matric}")
            raise serializers.ValidationError("Cannot save password: serializer data not validated.")
        new_password = validated.get('new_password')
        if not new_password:
            logger.error(f"[CHANGE_PASSWORD] No new password provided matric={matric}")
            raise serializers.ValidationError("New password not provided.")
        user.set_password(new_password)
        user.has_changed_password = True
        user.save(update_fields=['password', 'has_changed_password'])
        logger.info(f"[CHANGE_PASSWORD] Password changed successfully matric={matric}")
        return user
