from django.contrib.auth.password_validation import validate_password
from django.utils import timezone

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer as DefaultTokenObtainPairSerializer
from rest_framework import serializers
from .models import Student, Election, Position, Candidate, Vote


class TokenObtainPairSerializer(DefaultTokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['matric_number'] = user.matric_number

        return token
    

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
        if instance.picture:
            data['picture'] = instance.picture.url
        return data

    def create(self, validated_data):
        student: Student = Student.objects.create(**validated_data)
        return student


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
        fields = ['id', 'student', 'bio', 'photo']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.photo:
            data['photo'] = self.context['request'].build_absolute_uri(instance.photo.url)
        return data
    

class PositionSerializer(serializers.ModelSerializer):
    candidates = CandidateSerializer(many=True, read_only=True)

    class Meta:
        model = Position
        fields = ['id', 'name', 'candidates']


class ActiveElectionSerializer(serializers.ModelSerializer):
    positions = PositionSerializer(many=True, read_only=True)

    class Meta:
        model = Election
        fields = ['id', 'name', 'start_date', 'end_date', 'positions']


class VoteSerializer(serializers.ModelSerializer):
    voter = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Vote
        fields = ['id', 'voter', 'position', 'candidate']

    def validate(self, data):
        """
        Check that the candidate belongs to the position.
        """
        candidate = data.get('candidate')
        position = data.get('position')

        if candidate.position != position:
            raise serializers.ValidationError("This candidate is not running for the selected position.")
        
        if not position.election.is_active or not (position.election.start_date <= timezone.now() <= position.election.end_date):
            raise serializers.ValidationError("This election is not currently active.")

        return data
    