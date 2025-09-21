from django.core.management.base import BaseCommand
from content.models import SchoolStats, SocialMediaLink, HeroSlide, BreakingNews

class Command(BaseCommand):
    help = 'Populate sample data for content models'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create School Stats
        school_stats_data = [
            {
                'stat_name': 'Students',
                'stat_value': '2,500+',
                'stat_label': 'Active Students',
                'icon': 'users',
                'order_index': 1
            },
            {
                'stat_name': 'Teachers',
                'stat_value': '150+',
                'stat_label': 'Qualified Teachers',
                'icon': 'user-check',
                'order_index': 2
            },
            {
                'stat_name': 'Years',
                'stat_value': '25+',
                'stat_label': 'Years of Excellence',
                'icon': 'calendar',
                'order_index': 3
            },
            {
                'stat_name': 'Programs',
                'stat_value': '50+',
                'stat_label': 'Academic Programs',
                'icon': 'book',
                'order_index': 4
            }
        ]
        
        for stat_data in school_stats_data:
            stat, created = SchoolStats.objects.get_or_create(
                stat_name=stat_data['stat_name'],
                defaults=stat_data
            )
            if created:
                self.stdout.write(f'Created school stat: {stat.stat_name}')
            else:
                self.stdout.write(f'School stat already exists: {stat.stat_name}')
        
        # Create Social Media Links
        social_media_data = [
            {
                'platform': 'facebook',
                'url': 'https://facebook.com/potturschool',
                'icon': 'facebook',
                'order_index': 1
            },
            {
                'platform': 'twitter',
                'url': 'https://twitter.com/potturschool',
                'icon': 'twitter',
                'order_index': 2
            },
            {
                'platform': 'instagram',
                'url': 'https://instagram.com/potturschool',
                'icon': 'instagram',
                'order_index': 3
            },
            {
                'platform': 'youtube',
                'url': 'https://youtube.com/potturschool',
                'icon': 'youtube',
                'order_index': 4
            }
        ]
        
        for social_data in social_media_data:
            social, created = SocialMediaLink.objects.get_or_create(
                platform=social_data['platform'],
                defaults=social_data
            )
            if created:
                self.stdout.write(f'Created social media link: {social.platform}')
            else:
                self.stdout.write(f'Social media link already exists: {social.platform}')
        
        # Create Hero Slides
        hero_slides_data = [
            {
                'title': 'Welcome to Pottur School',
                'subtitle': 'Excellence in Education Since 1999',
                'image_url': '/src/assets/hero-image.jpg',
                'button_text': 'Learn More',
                'button_link': '/about',
                'order_index': 1
            },
            {
                'title': 'Quality Education',
                'subtitle': 'Nurturing Young Minds for a Bright Future',
                'image_url': '/src/assets/students-image.jpg',
                'button_text': 'Admissions',
                'button_link': '/admissions',
                'order_index': 2
            }
        ]
        
        for slide_data in hero_slides_data:
            slide, created = HeroSlide.objects.get_or_create(
                title=slide_data['title'],
                defaults=slide_data
            )
            if created:
                self.stdout.write(f'Created hero slide: {slide.title}')
            else:
                self.stdout.write(f'Hero slide already exists: {slide.title}')
        
        # Create Breaking News
        breaking_news_data = [
            {
                'title': 'Admissions Open for Academic Year 2024-25',
                'content': 'Applications are now being accepted for the upcoming academic year. Visit our admissions office for more details.',
                'priority': 1
            },
            {
                'title': 'Annual Sports Day - March 15th',
                'content': 'Join us for our annual sports day celebration. All parents and students are invited.',
                'priority': 2
            }
        ]
        
        for news_data in breaking_news_data:
            news, created = BreakingNews.objects.get_or_create(
                title=news_data['title'],
                defaults=news_data
            )
            if created:
                self.stdout.write(f'Created breaking news: {news.title}')
            else:
                self.stdout.write(f'Breaking news already exists: {news.title}')
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))