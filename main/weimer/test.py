import numpy as np
import os
from .w05sc import Calculator
from typing import List, Tuple
from .constants import Constants, ConstantsStatic, ConstantsTaken
from datetime import datetime

file_path = os.path.join('main', 'weimer', 'input_data')

fill = None


class AuroraCalculator(object):
    latitudes: List[float]
    longitudes: List[float]
    nlon: int
    nlat: int

    def __init__(self):
        self.latitudes = list(np.arange(30, 90 + 1, 1, dtype=np.float))
        self.longitudes = list(np.arange(0, 360 + 1, 2.5, dtype=np.float))
        self.nlon = len(self.longitudes)
        self.nlat = len(self.latitudes)

    def calc_epot(self, date: datetime = datetime.now()) -> Tuple[
        int, int, List[float], List[float], np.ndarray, datetime]:

        epot = np.zeros((self.nlon, self.nlat), np.float)
        calc = Calculator()
        try:
            consts: ConstantsTaken = ConstantsTaken(date)
        except Exception as e:
            raise Exception('no data for date '+str(date))
        calc.setmodel(consts.by, consts.bz, consts.tilt, consts.swvel, consts.swden, file_path, 'epot')
        mlt = [lon / 15 for lon in self.longitudes]
        for i in range(self.nlon):
            for j in range(self.nlat):
                epot[i][j] = calc.epotval(self.latitudes[j], mlt[i], fill)

        return self.nlon, self.nlat, self.longitudes, self.latitudes, epot, consts.time

    def calc_mpfac(self, date: datetime = datetime.now()) -> Tuple[
        int, int, List[float], List[float], np.ndarray, datetime]:

        mpfac = np.zeros((self.nlon, self.nlat), np.float)
        calc = Calculator()
        consts: ConstantsTaken = ConstantsTaken(date)
        calc.setmodel(consts.by, consts.bz, consts.tilt, consts.swvel, consts.swden, file_path, 'bpot')
        mlt = [lon / 15 for lon in self.longitudes]
        for i in range(self.nlon):
            for j in range(self.nlat):
                mpfac[i][j] = calc.mpfac(self.latitudes[j], mlt[i], fill)

        return self.nlon, self.nlat, self.longitudes, self.latitudes, mpfac, consts.time
