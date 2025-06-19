import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class StudentManager(BaseUserManager):
    def create_user(self, matric_number, full_name, level, password=None, **extra_fields):
        """
        Creates and saves a Student with the given matric_number, full_name, level and password.
        """
        if not matric_number:
            raise ValueError("Students must have a matric number")
        if not full_name:
            raise ValueError("Students must have a full name")

        # email = self.normalize_email(email)
        
        student = self.model(
            matric_number=matric_number,
            full_name=full_name,
            level=level,
            **extra_fields
        )
        student.set_password(password)
        student.save(using=self._db)
        return student

    def create_superuser(self, matric_number, full_name, level, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given details.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(matric_number, full_name, level, password, **extra_fields)


class Student(AbstractBaseUser, PermissionsMixin):
    
    LEVEL_CHOICES = [
        (100, '100 Level'), (200, '200 Level'), (300, '300 Level'),
        (400, '400 Level'), (500, '500 Level'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'), ('graduated', 'Graduated'), ('inactive', 'Inactive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matric_number = models.CharField(max_length=20, unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    level = models.IntegerField(choices=LEVEL_CHOICES)
    state_of_origin = models.CharField(max_length=50)
    
    email = models.EmailField(unique=True, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    picture = models.ImageField(upload_to='students/', blank=True, null=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    date_joined = models.DateTimeField(default=timezone.now)

    is_staff = models.BooleanField(
        default=False,
        help_text="Designates whether the user can log into this admin site."
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts."
    )
    
    objects = StudentManager()

    USERNAME_FIELD = 'matric_number'
    
    REQUIRED_FIELDS = ['full_name', 'level']

    def save(self, *args, **kwargs):
        """
        Override the save method to normalize the matric_number to uppercase.
        """
        if self.matric_number:
            self.matric_number = self.matric_number.upper()
        super().save(*args, **kwargs)

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
