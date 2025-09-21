import os
import django
import random
import string
from django.utils import timezone
from datetime import timedelta

# Set up Django environment
# This is a bit of a hack to make the script runnable from the root directory
# where the manage.py file is not present. We add the backend directory to the path.
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pottur_backend.settings')
django.setup()

# Import models
from accounts.models import User
from events.models import Event, EventCategory

# --- Custom Data Generation Functions ---

def random_string(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def random_sentence(words=5):
    return ' '.join(random_string(random.randint(3, 10)) for _ in range(words)).capitalize() + '.'

def random_text(paragraphs=2):
    return '\n'.join(random_sentence(random.randint(10, 20)) for _ in range(paragraphs))

def random_date_this_year(after_now=False):
    now = timezone.now()
    start_date = now if after_now else now.replace(month=1, day=1)
    end_date = now.replace(month=12, day=31)
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)

# --- Model Data Generation ---

def generate_users(count=10):
    for _ in range(count):
        try:
            User.objects.create_user(
                username=random_string(8),
                email=f"{random_string(5)}@example.com",
                password='password123'
            )
        except django.db.utils.IntegrityError:
            pass
    print(f"Generated users.")

def generate_event_categories():
    categories = ['Community', 'Academic', 'Sports', 'Arts & Culture', 'Fundraising']
    for name in categories:
        EventCategory.objects.get_or_create(name=name)
    print(f"Generated {len(categories)} event categories.")

def generate_events(count=20):
    users = list(User.objects.all())
    if not users:
        print("No users found. Please generate users first.")
        return
    categories = list(EventCategory.objects.all())
    if not categories:
        print("No event categories found. Please generate event categories first.")
        return

    for _ in range(count):
        Event.objects.create(
            title=random_sentence(4),
            description=random_text(),
            event_date=random_date_this_year(after_now=True),
            location=f"{random_string(8)} Street, {random_string(6)} City",
            category=random.choice(categories),
            created_by=random.choice(users)
        )
    print(f"Generated {count} events.")

if __name__ == '__main__':
    print("Generating dummy data...")
    generate_users()
    generate_event_categories()
    generate_events()
    print("Dummy data generation complete.")
