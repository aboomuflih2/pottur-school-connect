import random
import string
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import django

# Import models
from accounts.models import User, UserRole
from events.models import Event, EventCategory
from news.models import NewsCategory, NewsPost, NewsComment, NewsLike
from jobs.models import JobCategory, JobPosition, JobApplication
from academics.models import Department, Program, Course, Faculty
from admissions.models import KgStdApplication, PlusOneApplication
from gallery.models import GalleryPhoto
from content.models import HeroSlide, SchoolStats, Testimonial, ContactSubmission, BoardMember, BreakingNews

class Command(BaseCommand):
    help = 'Generates dummy data for the application.'

    def handle(self, *args, **options):
        self.stdout.write("Generating dummy data...")

        self.generate_users()
        self.generate_event_categories()
        self.generate_events()
        self.generate_news_data()
        self.generate_jobs_data()
        self.generate_academics_data()
        self.generate_admissions_data()
        self.generate_gallery_photos()
        self.generate_content_data()

        self.stdout.write(self.style.SUCCESS("Dummy data generation complete."))

    def random_string(self, length=10):
        letters = string.ascii_lowercase
        return ''.join(random.choice(letters) for i in range(length))

    def random_sentence(self, words=5):
        return ' '.join(self.random_string(random.randint(3, 10)) for _ in range(words)).capitalize() + '.'

    def random_text(self, paragraphs=2):
        return '\n'.join(self.random_sentence(random.randint(10, 20)) for _ in range(paragraphs))

    def random_date(self, start_date, end_date):
        delta = end_date - start_date
        random_days = random.randint(0, delta.days)
        return start_date + timedelta(days=random_days)

    def random_date_this_year(self, after_now=False):
        now = timezone.now()
        start = now if after_now else now.replace(month=1, day=1)
        end = now.replace(month=12, day=31)
        return self.random_date(start, end)

    def generate_users(self, count=10):
        for i in range(count):
            try:
                User.objects.create_user(
                    username=f"user{i}",
                    email=f"user{i}@example.com",
                    password='password123',
                    first_name=self.random_string(5).capitalize(),
                    last_name=self.random_string(8).capitalize()
                )
            except django.db.utils.IntegrityError:
                pass
        self.stdout.write(f"Generated users.")

    def generate_event_categories(self):
        categories = ['Community', 'Academic', 'Sports', 'Arts & Culture', 'Fundraising']
        for name in categories:
            EventCategory.objects.get_or_create(name=name)
        self.stdout.write(f"Generated {len(categories)} event categories.")

    def generate_events(self, count=20):
        users = list(User.objects.all())
        categories = list(EventCategory.objects.all())
        if not users or not categories: return

        for _ in range(count):
            Event.objects.create(
                title=self.random_sentence(4),
                description=self.random_text(),
                event_date=self.random_date_this_year(after_now=True),
                location=f"{self.random_string(8)} Street, {self.random_string(6)} City",
                category=random.choice(categories),
                created_by=random.choice(users)
            )
        self.stdout.write(f"Generated {count} events.")

    def generate_news_data(self):
        users = list(User.objects.all())
        if not users: return

        categories = ['School News', 'Achievements', 'Student Life', 'Alumni']
        for name in categories:
            NewsCategory.objects.get_or_create(name=name)

        news_categories = list(NewsCategory.objects.all())

        for _ in range(15):
            post = NewsPost.objects.create(
                title=self.random_sentence(6),
                slug=self.random_string(20),
                content=self.random_text(5),
                excerpt=self.random_sentence(15),
                category=random.choice(news_categories),
                author=random.choice(users),
                status='published',
                published_at=timezone.now()
            )
            # Create comments and likes
            for _ in range(random.randint(0, 5)):
                NewsComment.objects.create(post=post, author=random.choice(users), content=self.random_sentence(10))
            for _ in range(random.randint(0, 10)):
                NewsLike.objects.get_or_create(post=post, user=random.choice(users))

        self.stdout.write("Generated news data.")

    def generate_jobs_data(self):
        users = list(User.objects.all())
        if not users: return

        categories = ['Teaching', 'Administration', 'Support Staff', 'IT']
        for name in categories:
            JobCategory.objects.get_or_create(name=name)
        job_categories = list(JobCategory.objects.all())

        for _ in range(10):
            position = JobPosition.objects.create(
                title=f"{random.choice(['Senior', 'Junior', 'Lead'])} {self.random_string(8)} Teacher",
                slug=self.random_string(20),
                description=self.random_text(),
                requirements=self.random_text(),
                responsibilities=self.random_text(),
                category=random.choice(job_categories),
                department="Academics",
                location="Main Campus",
                employment_type='full_time',
                experience_level='mid',
                status='published',
                posted_by=random.choice(users)
            )
            JobApplication.objects.create(
                application_number=self.random_string(10).upper(),
                position=position,
                applicant=random.choice(users),
                first_name=self.random_string(5),
                last_name=self.random_string(8),
                email=f"{self.random_string(10)}@example.com",
                phone_number="1234567890",
                address="123 Main St",
                status='submitted'
            )
        self.stdout.write("Generated jobs data.")

    def generate_academics_data(self):
        department = Department.objects.create(name="Computer Science", code="CS")
        program = Program.objects.create(department=department, name="Bachelor of Science in CS", code="BSCS", duration_years=4, program_type="undergraduate")
        Course.objects.create(program=program, name="Introduction to Programming", code="CS101", credits=3)
        Faculty.objects.create(department=department, first_name="John", last_name="Doe", email="john.doe@example.com", designation="Professor", join_date=timezone.now().date())
        self.stdout.write("Generated academics data.")

    def generate_admissions_data(self):
        KgStdApplication.objects.create(student_name="Little Timmy", date_of_birth="2018-05-10", gender="male", parent_name="Timmy Sr.", parent_email="timmy.sr@example.com", parent_phone="555-1234", address="456 Oak Ave", grade_applying_for="Kindergarten")
        PlusOneApplication.objects.create(student_name="Jane Smith", date_of_birth="2008-08-20", gender="female", parent_name="John Smith", parent_email="john.smith@example.com", parent_phone="555-5678", address="789 Pine St", previous_school="Old School", sslc_marks=95.5, stream_preference="science", subjects_selected="Physics, Chemistry, Math")
        self.stdout.write("Generated admissions data.")

    def generate_gallery_photos(self):
        users = list(User.objects.all())
        if not users: return
        for i in range(10):
            GalleryPhoto.objects.create(
                title=f"Gallery Photo {i}",
                description=self.random_sentence(10),
                image_url=f"https://picsum.photos/800/600?random={i}",
                category=random.choice(['events', 'campus', 'students']),
                uploaded_by=random.choice(users)
            )
        self.stdout.write("Generated gallery photos.")

    def generate_content_data(self):
        for i in range(3):
            HeroSlide.objects.create(title=f"Slide {i}", subtitle=self.random_sentence(8), image_url=f"https://picsum.photos/1200/400?random={i}")
        SchoolStats.objects.create(stat_name="Students", stat_value="1000+", stat_label="Enrolled Students")
        Testimonial.objects.create(name="Happy Parent", designation="Parent", content=self.random_text())
        ContactSubmission.objects.create(name="A. User", email="a.user@example.com", subject="Inquiry", message=self.random_text())
        BoardMember.objects.create(name="Dr. Evelyn Reed", position="Chairperson", bio=self.random_text())
        BreakingNews.objects.create(title="Important Announcement", content=self.random_sentence(12))
        self.stdout.write("Generated content data.")
