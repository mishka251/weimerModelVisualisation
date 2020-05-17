from urllib.error import URLError

from django.core.management.base import BaseCommand
from main.models import WeimerModelConstants
from main.weimer.constants import ConstantsTaken, read_asc_1min
from datetime import datetime, timedelta
import calendar
from django.utils import timezone
import cProfile
from random import randrange
from datetime import timedelta

def random_date(start, end):
    """
    This function will return a random datetime between two datetime
    objects.
    """
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = randrange(int_delta)
    return start + timedelta(seconds=random_second)


def speed_test_tested():
    n = 10
    date_start = timezone.datetime(1983, 1, 1, tzinfo=timezone.utc)
    date_end = timezone.datetime(2019, 1, 1, tzinfo=timezone.utc)

    for _ in range(n):
        date = random_date(date_start, date_end)
        date = date-timedelta(seconds=date.second)
        print(date)
        constatns = ConstantsTaken(date)
        print(constatns)


class Command(BaseCommand):
    help = 'Load constants values from NASA and NOAA sites'

    def handle(self, *args, **options):

        #def test():
           # pass
        #cProfile.run('test()')
        speed_test_tested()
        print('end')
