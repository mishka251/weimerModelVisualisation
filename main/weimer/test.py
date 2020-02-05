import numpy as np
from .w05sc import Calculator
from typing import List, Tuple
from .constants import Constants, ConstantsStatic, ConstantsTaken

# by = 0.
# bz = -5.
# tilt = 0.
#
# swvel = 450.
# swden = 9.

#consts: Constants = ConstantsTaken()

file_path = "./main/weimer//input_data"

fill = 1.e36
#
# mlat = np.arange(-90, 90, 0.5)
#
# nlat: int = len(mlat)
# nlon: int = 25
#
# coeff = 10
#
# mlt = [i / coeff for i in range(coeff * nlon)]
# lon = [15 * i for i in range(coeff * nlon)]
#
# epot = np.zeros((coeff * nlon, nlat), np.float)
# fac = np.zeros((coeff * nlon, nlat), np.float)
#
# calc = Calculator()
# calc.setmodel(consts.by, consts.bz, consts.tilt, consts.swvel, consts.swden, file_path, 'epot')
#
# for i in range(coeff * nlon):
#     for j in range(nlat):
#         epot[i][j] = calc.epotval(mlat[j], mlt[i], fill)
#
# calc.setmodel(consts.by, consts.bz, consts.tilt, consts.swvel, consts.swden, file_path, 'bpot')
#
# for i in range(coeff * nlon):
#     for j in range(nlat):
#         fac[i][j] = calc.mpfac(mlat[j], mlt[i], fill)


class AuroraCalculator:
    latitudes: List[float]
    longitudes: List[float]
    nlon: int
    nlat: int

    def __init__(self):
        self.latitudes = list(np.arange(-90, 90, 1, dtype=np.float))
        self.longitudes = list(np.arange(0, 360, 5, dtype=np.float))
        self.nlon = len(self.longitudes)
        self.nlat = len(self.latitudes)

    def calc_epot(self) -> Tuple:

        epot = np.zeros((self.nlon, self.nlat), np.float)
        calc = Calculator()
        consts: Constants = ConstantsTaken()
        calc.setmodel(consts.by, consts.bz, consts.tilt, consts.swvel, consts.swden, file_path, 'epot')
        mlt = [lon / 15 for lon in self.longitudes]
        for i in range(self.nlon):
            for j in range(self.nlat):
                epot[i][j] = calc.epotval(self.latitudes[j], mlt[i], fill)

        return self.nlon, self.nlat, self.longitudes, self.latitudes, epot

    def calc_mpfac(self) -> Tuple:

        mpfac = np.zeros((self.nlon, self.nlat), np.float)
        calc = Calculator()
        consts: Constants = ConstantsTaken()
        calc.setmodel(consts.by, consts.bz, consts.tilt, consts.swvel, consts.swden, file_path, 'bpot')
        mlt = [lon / 15 for lon in self.longitudes]
        for i in range(self.nlon):
            for j in range(self.nlat):
                mpfac[i][j] = calc.mpfac(self.latitudes[j], mlt[i], fill)

        return self.nlon, self.nlat, self.longitudes, self.latitudes, mpfac

# datfile = 'output_data/wei05sc_epot_f90_big.dat'
# file = open(file=datfile, mode="w")
# file.write(f"{coeff*nlon} {nlat}\n")
# np.savetxt(file, mlt)  # file.write(str(mlt))
# np.savetxt(file, mlat)  # file.write(str(mlat))
# np.savetxt(file, epot)  # file.write(str(epot))
# file.close()
# print(f"('Wrote ascii file '{datfile})")
#
# datfile = 'output_data/wei05sc_fac_f90_big.dat'
# file = open(datfile, mode="w")
# file.write(f"{coeff*nlon} {nlat}\n")
# np.savetxt(file, mlt)  # file.write(str(mlt))
# np.savetxt(file, mlat)  # file.write(str(mlat))
# np.savetxt(file, fac)  # file.write(str(fac))
# file.close()
# print(f"('Wrote ascii file '{datfile})")
