from json import JSONDecodeError
from typing import List, Dict
from urllib.error import URLError

from django.core.management.base import BaseCommand
from main.models import WeimerModelConstants
from main.weimer.constants import get_json_from_url, PlasmaInfo, MagInfo
from datetime import datetime, timezone
import calendar


def add_months(sourcedate, months):
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return datetime(year, month, day)


class Command(BaseCommand):
    help = 'Load constants values from NASA and NOAA sites'

    def handle(self, *args, **options):
        base_url: str = "https://services.swpc.noaa.gov/products/solar-wind/"
        mag_file: str = "mag-7-day.json"
        plasma_file: str = "plasma-7-day.json"

        try:
            mag2: List[List[str]] = get_json_from_url(base_url + mag_file)
            plasma2: List[List[str]] = get_json_from_url(base_url + plasma_file)

            plasma_format: List[str] = ['time_tag', 'density', 'speed', 'temperature']
            mag_format: List[str] = ['time_tag', 'bx_gsm', 'by_gsm', 'bz_gsm', 'lon_gsm', 'lat_gsm', 'bt']
            #
            assert mag2[0] == mag_format, "Неверный формат файла mag"
            assert plasma2[0] == plasma_format, "Неверный формаьт фалйа plasma"

            del mag2[0]
            del plasma2[0]

            plasma_by_time: Dict[datetime, PlasmaInfo] = {}
            #
            datetime_format = "%Y-%m-%d %H:%M:%S.%f"
            for plasma_item in plasma2:
                if all(plasma_item):
                    dat = datetime.strptime(plasma_item[0], datetime_format)
                    dat = datetime(dat.year, dat.month, dat.day, dat.hour, dat.minute, dat.second, tzinfo=timezone.utc)
                    plasma_by_time.update({dat: PlasmaInfo(float(plasma_item[2]), float(plasma_item[1]))})

            mag_by_time: Dict[datetime, MagInfo] = {}

            for mag_item in mag2:
                if all(mag_item):
                    dat = datetime.strptime(mag_item[0], datetime_format)
                    dat = datetime(dat.year, dat.month, dat.day, dat.hour, dat.minute, dat.second, tzinfo=timezone.utc)
                    mag_by_time.update(
                        {dat: MagInfo(float(mag_item[1]), float(mag_item[2]), float(mag_item[3]), float(mag_item[6]))})

            plasma_times = set(plasma_by_time.keys())
            mag_times = set(mag_by_time.keys())
            times = plasma_times & mag_times

            for date in times:
                defaults = {'magnetic_by': mag_by_time[date].by,
                            'magnetic_bz': mag_by_time[date].bz,
                            'plasma_density': plasma_by_time[date].density,
                            'plasma_speed': plasma_by_time[date].speed}
                WeimerModelConstants.objects.update_or_create(datetime=date, defaults=defaults)

        except URLError as e:
            print('url error')
            print(e)
        except JSONDecodeError as e:
            print('json decode error')
            print(e)
        except Exception as e:
            print('unknown exception')
            print(e)

        print('end')
