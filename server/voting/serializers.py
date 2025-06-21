from django.utils import timezone
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
            'email', 'phone_number', 'picture', 'status', 'is_active', 'date_joined'
        ]
        read_only_fields = ['is_active', 'date_joined']

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
    election_name = serializers.CharField(source='election.name', read_only=True)
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Position
        fields = ['id', 'name', 'candidate_count', 'election_name', 'candidates', 'has_voted']

    def get_candidate_count(self, position):
        return Student.objects.filter(
            level=500, 
            status='active', 
        ).count()

    def get_candidates(self, position):
        # Only return candidates when fetching position detail (single instance)
        if self.context.get('view') and hasattr(self.context['view'], 'action'):
            if self.context['view'].action == 'retrieve':
                students = Student.objects.filter(level=500, status='active')
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
        fields = ['id', 'name', 'start_date', 'end_date', 'positions']


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
    student_voted_for = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.filter(level=500, status='active')
    )

    class Meta:
        model = Vote
        fields = ['id', 'voter', 'position', 'student_voted_for']

    def validate(self, data):
        position = data.get('position')
        candidate = data.get('student_voted_for')

        if not position.election.is_active or not (position.election.start_date <= timezone.now() <= position.election.end_date):
            raise serializers.ValidationError("This election is not currently active.")

        if not (candidate.level == 500 and candidate.status == 'active'):
            raise serializers.ValidationError(f"{candidate.full_name} is not eligible to be voted for.")

        return data
