import numpy as np
from .w05sc import Calculator

from .constants import Constants, ConstantsStatic, ConstantsTaken

# by = 0.
# bz = -5.
# tilt = 0.
#
# swvel = 450.
# swden = 9.

consts:Constants = ConstantsStatic()

file_path = "./data/"

fill = 1.e36

mlat = np.arange(-90, 90, 0.5)

nlat: int = len(mlat)
nlon: int = 25

coeff = 10

mlt = [i / coeff for i in range(coeff * nlon)]
lon = [15 * i for i in range(coeff * nlon)]

epot = np.zeros((coeff * nlon, nlat), np.float)
fac = np.zeros((coeff * nlon, nlat), np.float)

calc = Calculator()
calc.setmodel(consts.by, consts.bz, consts.tilt, consts.swvel, consts.swden, file_path, 'epot')

for i in range(coeff * nlon):
    for j in range(nlat):
        epot[i][j] = calc.epotval(mlat[j], mlt[i], fill)

calc.setmodel(consts.by, consts.bz, consts.tilt, consts.swvel, consts.swden, file_path, 'bpot')

for i in range(coeff * nlon):
    for j in range(nlat):
        fac[i][j] = calc.mpfac(mlat[j], mlt[i], fill)

datfile = 'wei05sc_epot_f90_big.dat'
file = open(file=datfile, mode="w")
file.write(f"{coeff*nlon} {nlat}\n")
np.savetxt(file, mlt)  # file.write(str(mlt))
np.savetxt(file, mlat)  # file.write(str(mlat))
np.savetxt(file, epot)  # file.write(str(epot))
file.close()
print(f"('Wrote ascii file '{datfile})")

datfile = 'wei05sc_fac_f90_big.dat'
file = open(datfile, mode="w")
file.write(f"{coeff*nlon} {nlat}\n")
np.savetxt(file, mlt)  # file.write(str(mlt))
np.savetxt(file, mlat)  # file.write(str(mlat))
np.savetxt(file, fac)  # file.write(str(fac))
file.close()
print(f"('Wrote ascii file '{datfile})")
