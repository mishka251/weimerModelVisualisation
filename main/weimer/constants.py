from urllib.request import urlopen
import json
from http.client import HTTPResponse
from typing import List, Dict
from datetime import datetime
from math import atan2, degrees

class PlasmaInfo(object):
    """
    Информация о плазме солнечного ветра
    :speed - скорость км/с
    :density плотность частиц/см^2
    :temperature - температура К

    """
    speed: float
    density: float
    temperature: float

    def __init__(self, items: List[str]):
        self.speed = float(items[2])
        self.density = float(items[1])
        self.temperature = float(items[3])

    @property
    def pressure(self) -> float:
        """
        давление солнечного ветра?
        единицы измерения? единиц/c^2 *10^??
        :return:
        """
        return self.density * self.speed ** 2 * 1.6726e-6


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
    lon: float
    lat: float
    bt: float

    angle:float

    def __init__(self, items: List[str]):
        self.bx = float(items[1])
        self.by = float(items[2])
        self.bz = float(items[3])
        self.lon = float(items[4])
        self.lat = float(items[5])
        self.bt = float(items[6])

        self.angle: float = degrees(atan2(self.by, self.bz))  # градусы


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


def get_json_from_url(url: str):
    response: HTTPResponse = urlopen(url)
    encoding: str = response.info().get_content_charset('utf-8')
    data: bytes = response.read()
    return json.loads(data.decode(encoding))


class ConstantsTaken(Constants):
    """
    Константы, получаемые с сервисов из сети
    """
    tilt: float = 0

    def __init__(self):
        base_url: str = "https://services.swpc.noaa.gov/products/solar-wind/"
        mag_file: str = "mag-1-day.json"
        plasma_file: str = "plasma-1-day.json"

        mag: List[List[str]] = get_json_from_url(base_url + mag_file)
        plasma: List[List[str]] = get_json_from_url(base_url + plasma_file)

        plasma_format: List[str] = ['time_tag', 'density', 'speed', 'temperature']
        mag_format: List[str] = ['time_tag', 'bx_gsm', 'by_gsm', 'bz_gsm', 'lon_gsm', 'lat_gsm', 'bt']

        assert mag[0] == mag_format, "Неверный формат файла mag"
        assert plasma[0] == plasma_format, "Неверный формаьт фалйа plasma"

        del mag[0]
        del plasma[0]

        plasma_by_time: Dict[datetime, PlasmaInfo] = {}

        datetime_format = "%Y-%m-%d %H:%M:%S.%f"
        for plasma_item in plasma:
            if all(plasma_item):
                date = datetime.strptime(plasma_item[0], datetime_format)
                plasma_by_time.update({date: PlasmaInfo(plasma_item)})

        mag_by_time: Dict[datetime, MagInfo] = {}

        for mag_item in mag:
            if all(mag_item):
                date = datetime.strptime(mag_item[0], datetime_format)
                mag_by_time.update({date: MagInfo(mag_item)})

        plasma_times = set(plasma_by_time.keys())
        mag_times = set(mag_by_time.keys())
        times = plasma_times & mag_times

        last_time = max(times)
        last_mag = mag_by_time[last_time]
        last_plasma = plasma_by_time[last_time]

        self.by = last_mag.by
        self.bz = last_mag.bz

        self.swden = last_plasma.density
        self.swvel = last_plasma.speed

        # print(mag)
