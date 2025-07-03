from celery import group
from django.core.management.base import BaseCommand, CommandError

from tasks import update_eurex_history, update_cme_history, update_cboe_history

class Command(BaseCommand):
    help = "Load markets history from remote server."

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def handle(self, *args, **options):
        try:
            self.stdout.write(self.style.SUCCESS('Start to initialize markets history...'))
            group(
                update_cboe_history(),
                update_cme_history.delay(),
                update_eurex_history.delay(),
            )
            
            self.stdout.write(self.style.SUCCESS('Markets history initialized successfully'))
        except Exception:
                raise CommandError("Error on loading markets history")