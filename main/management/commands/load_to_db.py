from urllib.error import URLError

from django.core.management.base import BaseCommand, CommandParser
from main.models import WeimerModelConstants
from main.weimer.constants import ConstantsTaken, read_asc_1min
from datetime import datetime, timedelta
import calendar
from django.utils import timezone


date_format='%Y.%m'

def add_months(sourcedate, months):
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return datetime(year, month, day)


class Command(BaseCommand):
    help = 'Load constants values from NASA and site'

    def add_arguments(self, parser:CommandParser):
        parser.add_argument(
            '--from',
            action='store',
            default='1982.01',
            type=str,
            help='Начиная с какой даты загружать YYYY.MM'
        )
        parser.add_argument(
            '--to',
            action='store',
            default=timezone.datetime.now().strftime(date_format),
            type=str,
            help='До какой даты загружать YYYY.MM'
        )


    def handle(self, *args, **options):
        begin = timezone.datetime.strptime(options['from'], date_format)
        end =timezone.datetime.strptime(options['to'], date_format)
        #begin = timezone.datetime(2013, 3, 1, 0, 0, 0)
        #end = timezone.datetime(2020, 5, 1, 0, 0, 0)
        now = begin
        while now <= end:
            try:
                # constants: ConstantsTaken = ConstantsTaken(now)
                url: str = f"https://spdf.gsfc.nasa.gov/pub/data/omni/high_res_omni/monthly_1min/omni_min{now.strftime('%Y%m')}.asc"
                try:
                    dates = read_asc_1min(url)
                except URLError as e:
                    print(now, e)
                    dates = {}
                for date in dates:
                    defaults = {'magnetic_by': dates[date].magnetic.by,
                                'magnetic_bz': dates[date].magnetic.bz,
                                'plasma_density': dates[date].plasma.density,
                                'plasma_speed': dates[date].plasma.speed}
                    WeimerModelConstants.objects.update_or_create(datetime=date, defaults=defaults)
                print(now)

            except Exception as e:
                print(now, e)

            now = add_months(now, 1)

        print('end')
