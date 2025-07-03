import os
import json
from django.apps import apps
from django.core.management.base import BaseCommand, CommandError
from celery import chord

from tasks import *

from utils.mongodb import db

class Command(BaseCommand):
    help = "Insert markets from a JSON file. " \
           "JSON file name(s) should be passed."

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


    def insert_to_market(self, data):
        try:
            market_collection = db.market
            data["expirations"] = []
            data["underlying"] = {}
            market_collection.replace_one({'exchange': data["exchange"], 'symbol': data["symbol"]}, data, upsert=True)
        except Exception as e:
            raise CommandError("Error in inserting market {}: {}".format(
                data["label"], str(e)))

    def insert_to_group(self, data):
        try:
            group_collection = db.group
            group_collection.replace_one({'symbol': data["symbol"]}, data, upsert=True)
        except Exception as e:
            raise CommandError("Error in inserting group {}: {}".format(
                data["name"], str(e)))

    def insert_to_exchange(self, data):
        try:
            exchange_collection = db.exchange
            exchange_collection.replace_one({'symbol': data["symbol"]}, data, upsert=True)
        except Exception as e:
            raise CommandError("Error in inserting exchange {}: {}".format(
                data["name"], str(e)))

    def get_current_app_path(self):
        return apps.get_app_config('utils').path

    def get_json_file(self, filename):
        app_path = self.get_current_app_path()
        file_path = os.path.join(app_path, "management",
                                 "commands", filename)
        return file_path

    def add_arguments(self, parser):
        parser.add_argument('filenames',
                            nargs='+',
                            type=str,
                            help="Inserts markets from JSON file")

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start to initialize the database...'))

        for filename in options['filenames']:
            self.stdout.write(self.style.SUCCESS('Reading:{}'.format(filename)))

            try:
                with open(filename) as json_file:
                    data = json.load(json_file)
                    for group in data["groups"]:
                        self.insert_to_group(group)

                    for exchange in data["exchanges"]:
                        self.insert_to_exchange(exchange)
                    
                    for market in data["markets"]:
                        self.insert_to_market(market)


                self.stdout.write(self.style.SUCCESS('Database initialized successfully'))

                chord([
                    update_cboe.si(),
                    #update_cme.si(),
                    update_eurex.si(),
                ], 
                    chord([
                        update_cboe_history.si(),
                        #update_cme_history.si(),
                        update_eurex_history.si()
                    ], 
                        update_history.si()
                    )
                ).apply_async()

                self.stdout.write(self.style.SUCCESS('Single celery workflows started'))

            except FileNotFoundError:
                raise CommandError("File {} does not exist".format(filename))