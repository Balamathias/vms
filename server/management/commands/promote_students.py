from django.core.management.base import BaseCommand
from django.db.models import F
from voting.models import Student

class Command(BaseCommand):
    """
    Command to promote students to the next level and graduate 500L students.
    """

    help = 'Promotes all active students to the next level and graduates 500L students.'

    def handle(self, *args, **options):
        self.stdout.write("Starting student promotion process...")

        graduated_count = Student.objects.filter(level=500, status='active').update(status='graduated')
        self.stdout.write(self.style.SUCCESS(f"Graduated {graduated_count} students."))

        # Promote all other active students
        # We promote in reverse order to avoid promoting someone twice in one run.
        for level in sorted([400, 300, 200, 100], reverse=True):
            promoted_count = Student.objects.filter(level=level, status='active').update(level=F('level') + 100)
            self.stdout.write(f"Promoted {promoted_count} students from {level} to {level + 100} Level.")
            
        self.stdout.write(self.style.SUCCESS("Student promotion process completed."))
        