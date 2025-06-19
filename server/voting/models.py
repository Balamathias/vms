from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class Student(AbstractUser):

    LEVEL_CHOICES = [
        (100, '100 Level'),
        (200, '200 Level'),
        (300, '300 Level'),
        (400, '400 Level'),
        (500, '500 Level'),
    ]
    level = models.IntegerField(choices=LEVEL_CHOICES)
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('graduated', 'Graduated'),
        ('inactive', 'Inactive'),
    ]

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    matric_number = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    level = models.IntegerField(choices=LEVEL_CHOICES)
    state_of_origin = models.CharField(max_length=50)

    email = models.EmailField(unique=True, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    picture = models.ImageField(upload_to='students/', blank=True, null=True)

    USERNAME_FIELD = 'matric_number'
    REQUIRED_FIELDS = ['full_name', 'level']

    def __str__(self):
        return f"{self.full_name} ({self.matric_number})"
    

class Election(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255, help_text="e.g., 'Graduating Class Awards 2024'")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Position(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255, help_text="e.g., 'Best Dressed', 'Most Innovative'")
    election = models.ForeignKey(Election, related_name='positions', on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.name} ({self.election.name})"


class Candidate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    position = models.ForeignKey(Position, related_name='candidates', on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='candidates/', blank=True, null=True)

    class Meta:
        unique_together = ('student', 'position')

    def __str__(self):
        return f"{self.student.full_name} for {self.position.name}"
    

class Vote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    voter = models.ForeignKey(Student, on_delete=models.CASCADE)
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    voted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('voter', 'position')

    def __str__(self):
        return f"Vote by {self.voter.matric_number} for {self.candidate.student.full_name} in {self.position.name}"
