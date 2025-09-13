import uuid
from venv import create
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MinLengthValidator


class StudentManager(BaseUserManager):
    def create_user(self, matric_number, full_name, level, password=None, **extra_fields):
        if not matric_number:
            raise ValueError("Students must have a matric number")
        if not full_name:
            raise ValueError("Students must have a full name")

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
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if not extra_fields.get('is_staff'):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get('is_superuser'):
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

    date_of_birth = models.DateField(blank=True, null=True)

    email = models.EmailField(unique=True, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    picture = models.ImageField(upload_to='students/', blank=True, null=True)

    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], default='other')

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    date_joined = models.DateTimeField(default=timezone.now)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    is_verified = models.BooleanField(default=False, help_text="Indicates if the student has verified their account")
    has_changed_password = models.BooleanField(default=False, help_text="Indicates if the student has changed password at least once")

    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    objects = StudentManager()

    USERNAME_FIELD = 'matric_number'
    REQUIRED_FIELDS = ['full_name', 'level']

    def save(self, *args, **kwargs):
        if self.matric_number:
            self.matric_number = self.matric_number.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.matric_number})"

    @property
    def is_candidate(self):
        # Backward compatibility: any active nomination
        return self.status == 'active' and Candidate.objects.filter(student=self).exists()


class Election(models.Model):
    TYPE_CHOICES = [
        ('general', 'General'),
        ('specific', 'Specific'),  # (final year only voters)
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="e.g., 'Graduating Class Awards 2024'")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='general')  # NEW

    def __str__(self):
        return self.name

    @property
    def is_ongoing(self):
        now = timezone.now()
        return self.start_date <= now <= self.end_date


class Position(models.Model):
    GENDER_RESTRICTION_CHOICES = [
        ('any', 'Any Gender'),
        ('male', 'Male Only'),
        ('female', 'Female Only'),
    ]

    POSITION_CHOICES = [
        ('junior', 'Junior Award'),
        ('senior', 'Senior Award'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="e.g., 'Best Dressed', 'Most Innovative'")
    election = models.ForeignKey(Election, related_name='positions', on_delete=models.CASCADE)
    gender_restriction = models.CharField(
        max_length=10, 
        choices=GENDER_RESTRICTION_CHOICES, 
        default='any',
        help_text="Restrict this position to specific gender"
    )
    position_type = models.CharField(
        max_length=10,
        choices=POSITION_CHOICES,
        default='senior',
        help_text="The type of position"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.election.name})"

    def get_eligible_candidates(self):
        """
        Return nominated (Candidate) students for this position (active only).
        Previously used Student.is_nominated + level/gender logic.
        Election-level voting restrictions are now enforced during vote validation,
        not here, to keep returned candidate list consistent for all voters.
        """
        return Student.objects.filter(
            candidate__position=self,
            status='active'
        ).distinct()


class Candidate(models.Model):
    """
    Nomination record for a student in a specific position.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    position = models.ForeignKey(Position, related_name='candidates', on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='candidates/', blank=True, null=True)

    alias = models.CharField(max_length=100, blank=True, null=True, help_text="Optional alias or nickname for the candidate")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'position')

    def __str__(self):
        return f"Enhancement for {self.student.full_name} → {self.position.name}"
    

class Vote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    voter = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='votes_cast')
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='votes')
    student_voted_for = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='votes_received')

    voted_at = models.DateTimeField(auto_now_add=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('voter', 'position')

    def __str__(self):
        return f"Vote by {self.voter.matric_number} → {self.student_voted_for.full_name} ({self.position.name})"

    def clean(self):
        # Ensure the voted-for student is nominated for that position
        if not Candidate.objects.filter(student=self.student_voted_for, position=self.position).exists():
            raise ValidationError("Student is not a nominated candidate for this position.")


class IPRestriction(models.Model):
    ip_address = models.GenericIPAddressField(unique=True)
    is_blocked = models.BooleanField(default=False)
    max_accounts_per_ip = models.PositiveIntegerField(default=3)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"IP: {self.ip_address} - {'Blocked' if self.is_blocked else 'Allowed'}"

class LoginAttempt(models.Model):
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    matric_number = models.CharField(max_length=20, null=True, blank=True)
    success = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']

class VoteAttempt(models.Model):
    voter = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    success = models.BooleanField(default=False)
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    user_agent = models.TextField()
    
    class Meta:
        ordering = ['-timestamp']


class DeviceFingerprint(models.Model):
    """Represents a device fingerprint that can be bound to a single student
    upon successful password change. We only store a hash, never the raw
    fingerprint value.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fingerprint_hash = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        validators=[MinLengthValidator(32)],
        help_text="SHA-256 (hex) of the device fingerprint"
    )
    bound_to = models.ForeignKey(
        Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='device_fingerprints'
    )
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    bound_at = models.DateTimeField(null=True, blank=True)
    last_user_agent = models.TextField(blank=True, default='')
    last_ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-last_seen']

    def __str__(self):
        owner = self.bound_to.matric_number if self.bound_to else 'unbound'
        return f"FP[{self.fingerprint_hash[:8]}…] → {owner}"


class PasswordChangeAttempt(models.Model):
    """Log each password change attempt for auditing and abuse detection."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True)
    matric_number = models.CharField(max_length=20, db_index=True)
    fingerprint_hash = models.CharField(max_length=64, db_index=True)
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    success = models.BooleanField(default=False)
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        status = 'OK' if self.success else 'FAIL'
        return f"PWD[{status}] {self.matric_number} fp={self.fingerprint_hash[:8]}…"
