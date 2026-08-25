from django.core.management.base import BaseCommand
from content.models import Content


class Command(BaseCommand):
    help = "Publish scheduled contents whose scheduled time has passed."

    def handle(self, *args, **options):
        count = Content.publish_due()
        self.stdout.write(self.style.SUCCESS(f"Published {count} scheduled content(s)."))
