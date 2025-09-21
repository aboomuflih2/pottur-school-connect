from django.core.management.base import BaseCommand
from content.models import HeroSlide

class Command(BaseCommand):
    help = 'Update hero slide images to use local assets'

    def handle(self, *args, **options):
        self.stdout.write('Updating hero slide images...')
        
        # Update the first hero slide
        updated1 = HeroSlide.objects.filter(title='Welcome to Pottur School').update(
            image_url='/src/assets/hero-image.jpg'
        )
        
        # Update the second hero slide
        updated2 = HeroSlide.objects.filter(title='Quality Education').update(
            image_url='/src/assets/students-image.jpg'
        )
        
        self.stdout.write(f'Updated {updated1} hero slide(s) for "Welcome to Pottur School"')
        self.stdout.write(f'Updated {updated2} hero slide(s) for "Quality Education"')
        
        self.stdout.write(self.style.SUCCESS('Hero slide images updated successfully!'))