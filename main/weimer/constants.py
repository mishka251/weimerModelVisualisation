from urllib.error import URLError
from urllib.request import urlopen
import json
from http.client import HTTPResponse
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from math import atan2, degrees, sqrt
import numpy
from django.utils import timezone
from main.models import WeimerModelConstants

unpossible_values = [9999.99, 999999, 999.99, 99999.9, 999.999]


class PlasmaInfo(object):
    """
    Информация о плазме солнечного ветра
    :speed - скорость км/с
    :density плотность частиц/см^2
    :temperature - температура К

    """
    speed: float
    density: float

    # temperature: float

    def __init__(self, speed: float, density: float):
        self.speed = speed  # float(items[2])
        self.density = density  # float(items[1])
        # self.temperature = temperature  # float(items[3])

    @property
    def pressure(self) -> float:
        """
        давление солнечного ветра?
        единицы измерения? единиц/c^2 *10^??
        :return:
        """
        return self.density * self.speed ** 2 * 1.6726e-6

    @property
    def valid(self):
        return self.speed not in unpossible_values \
               and self.density not in unpossible_values


class MagInfo(object):
    """
    Информация о магнтином поле
    :bx
    :by
    :bz

    :lon
    :lat

    :bt
    """
    bx: float
    by: float
    bz: float
    # lon: float
    # lat: float
    bt: float

    # angle: float

    def __init__(self, bx: float, by: float, bz: float, bt: float):
        self.bx = bx  # float(items[1])
        self.by = by  # float(items[2])
        self.bz = bz  # float(items[3])
        # self.lon = float(items[4])
        # self.lat = float(items[5])
        self.bt = bt  # float(items[6])

        # self.angle: float = degrees(atan2(self.by, self.bz))  # градусы

    @property
    def valid(self):
        return self.bx not in unpossible_values \
               and self.by not in unpossible_values \
               and self.bz not in unpossible_values


class Constants(object):
    """
    :by
    :bz

    :swvel
    :swden

    :tilt
    """
    by: float
    bz: float
    tilt: float

    swvel: float
    swden: float


class ConstantsStatic(Constants):
    """
    статически заданные константы из примера
    """

    def __init__(self):
        self.by = 0
        self.bz = -5
        self.tilt = 0

        self.swvel = 450
        self.swden = 9


class Info(object):
    magnetic: MagInfo
    plasma: PlasmaInfo

    def __init__(self, mag: MagInfo, plasma: PlasmaInfo):
        self.magnetic = mag
        self.plasma = plasma


def get_json_from_url(url: str):
    response: HTTPResponse = urlopen(url)
    encoding: str = response.info().get_content_charset('utf-8')
    data: bytes = response.read()
    return json.loads(data.decode(encoding))


def get_from_noaa(date: datetime) -> Tuple[float, float, float, float]:
    base_url: str = "https://services.swpc.noaa.gov/products/solar-wind/"
    mag_file: str = "mag-7-day.json"
    plasma_file: str = "plasma-7-day.json"
    try:
        mag2: List[List[str]] = get_json_from_url(base_url + mag_file)
        plasma2: List[List[str]] = get_json_from_url(base_url + plasma_file)
    except URLError as e:
        raise Exception("Не удалось получить данные с сайта NOAA", e)
        # return None

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

    if date in mag_by_time and date in plasma_by_time:
        return plasma_by_time[date].density, plasma_by_time[date].speed, mag_by_time[date].by, mag_by_time[date].bz
        # Info(mag_by_time[date], plasma_by_time[date])

    raise Exception("Нет данных")


def read_asc_1min(url: str) -> Dict[datetime, Info]:
    response: HTTPResponse = urlopen(url)
    encoding: str = response.info().get_content_charset('utf-8')
    file: str = response.read().decode(encoding)
    data: Dict[datetime, Info] = {}
    lines: List[str] = list(map(lambda s: s.split(), file.split()))
    lines = numpy.array_split(lines, len(lines) / 46)
    for line in lines:
        year = int(line[0])
        day = int(line[1])
        hour = int(line[2])
        minute = int(line[3])

        bx = float(line[14])
        by = float(line[15])
        bz = float(line[16])
        _bt = sqrt(bx * bx + by * by + bz * bz)
        bt = _bt  # float(line[20])

        speed = float(line[21])
        density = float(line[25])
        date = timezone.datetime(year, 1, 1, hour, minute, tzinfo=timezone.utc)
        date += timedelta(day - 1)
        mag = MagInfo(bx, by, bz, bt)
        plasma = PlasmaInfo(speed, density)

        if mag.valid and plasma.valid:
            data[date] = Info(mag, plasma)

    return data


def get_data_from_nasa(now):
    url: str = f"https://spdf.gsfc.nasa.gov/pub/data/omni/high_res_omni/monthly_1min/omni_min{now.strftime('%Y%m')}.asc"
    dates = read_asc_1min(url)
    return dates[now].plasma.density, dates[now].plasma.speed, dates[now].magnetic.by, dates[now].magnetic.bz


class ConstantsTaken(Constants):
    """
    Константы, получаемые с сервисов из сети
    """
    tilt: float = 0
    time: datetime = None

    def get_db_values(self, date: datetime) -> Tuple[float, float, float, float]:
        obj: WeimerModelConstants = WeimerModelConstants.objects.get(datetime=date)
        return obj.plasma_density, obj.plasma_speed, obj.magnetic_by, obj.magnetic_bz

    def __init__(self, date: datetime = datetime.now()):
        # try:
        #     self.swden, self.swvel, self.by, self.bz = self.get_db_values(date)
        #
        #     print('get db ok')
        #     return
        # except WeimerModelConstants.DoesNotExist as e:
        #     print(e)

        try:
            if datetime.now(tz=timezone.utc) - date < timedelta(weeks=1):
                self.swden, self.swvel, self.by, self.bz = get_from_noaa(date)  # self.get_foreign_data(date)
            else:
                self.swden, self.swvel, self.by, self.bz = get_data_from_nasa(date)  # self.get_foreign_data(date)
            print('get remote ok')
            return
        except Exception as e:
            print(e)
            foreign_data = None
        raise Exception('no data for this datetime')
