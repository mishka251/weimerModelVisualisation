import numpy as np
from math import pi, sqrt, atan2, radians, degrees, sin, exp, cos, asin
import os
from typing import List, Tuple

from .reader import Reader
from .utils import interpol_quad, km_n


class Calculator(object):
    reader: Reader = Reader()

    bndyfitr: float
    esphc: np.ndarray  # = [0] * reader.csize
    bsphc: np.ndarray  # = [0] * reader.csize
    tmat: np.ndarray = np.zeros((3, 3), np.float)
    mxtablesize: int = 200

    plmtable: List[List[float]] = np.zeros((mxtablesize, reader.csize))
    colattable: List[float] = np.zeros(mxtablesize, np.float)
    nlms: List[float] = np.zeros(reader.csize, np.float)

    def do_rotation(self, latin: float, lonin: float) -> Tuple[float, float]:
        """
        Поворот, преобразование широты долгота(в градусах)
        В широта, долгота в градусах
        :param latin: широта в градусах
        :param lonin: долгато в традусах
        :return:latout,lonout градусы
        """

        latr: float = radians(latin)
        lonr: float = radians(lonin)

        stc: float = sin(latr)
        ctc: float = cos(latr)

        sf: float = sin(lonr)
        cf: float = cos(lonr)

        a: float = ctc * cf
        b: float = ctc * sf

        pos: np.ndarray = np.dot([a, b, stc], self.tmat)

        latout: float = degrees(asin(pos[2]))
        lonout: float = degrees(atan2(pos[1], pos[0]))

        return latout, lonout

    def checkinputs(self, lat: float, mlt: float) -> Tuple[int, float, float]:
        """
        ???
        :param lat: широта
        :param mlt:
        :return:  inside: int, phir: float, colat: float
        """
        tlat: float
        tlon: float

        lon: float = mlt * 15.  # координаты в градусах
        tlat, tlon = self.do_rotation(lat, lon)
        radii: float = 90. - tlat

        inside: int = 1 if (radii <= self.bndyfitr) else 0
        phir: float = radians(tlon)
        colat: float = radii

        return inside, phir, colat

    def nkmlookup(self, k: int, m: int, th0: float) -> float:
        """
        ???
        :param k:
        :param m:
        :param th0:
        :return:
        """
        if th0 == 90.:
            return float(k)

        th0a: float = th0

        th0s: List[float] = self.reader.th0s
        all_nkm: List[List[List[float]]] = self.reader.allnkm

        res: List[float] = interpol_quad(all_nkm[k][m], th0s, [th0a])
        return res[0]

    def pm_n(self, m: int, r: float, cth: List[float], table_size: int) -> List[float]:
        """
        ???
        :param m:
        :param r:
        :param cth:
        :param table_size:
        :return:
        """
        a: List[float]
        if m == 0:
            a = [1] * table_size
        else:
            a = [sqrt(1 - ct ** 2) ** m for ct in cth]
        xn: float = r * (r + 1)

        x = [(1 - ct) / 2 for ct in cth]

        table: List[float] = [a_i for a_i in a]

        tmp: List[float] = [10000] * table_size
        k = 1
        while max(tmp) > 1e-6:
            for i in range(table_size):
                a[i] *= (x[i] * ((k + m - 1.) * (k + m) - xn) / (k * (k + m)))
                table[i] += a[i]

            k += 1

            for i in range(table_size):
                div = abs(table[i])
                div = max(div, 1e-6)
                tmp[i] = abs(a[i]) / div

        ans = km_n(m, r)
        return [t * ans for t in table]

    prev_th0 = 1e36

    def scplm(self, index: int, colat: float) -> Tuple[float, float]:
        ls: List[int] = self.reader.ls
        ms: List[int] = self.reader.ms
        ab: List[float] = self.reader.ab
        skip: bool = False
        th0: float = self.bndyfitr
        if self.prev_th0 != th0:
            self.tablesize = 3 * int(round(th0))
            assert self.tablesize <= self.mxtablesize, \
                f"('>>> tablesize > mxtablesize: tablesize={self.tablesize} mxtablesize={self.mxtablesize} tn0={th0}"

            self.colattable = [i * (th0 / float(self.tablesize - 1)) for i in range(self.tablesize)]
            cth: List[float] = [cos(radians(col)) for col in self.colattable]
            self.prev_th0 = th0
            self.nlms: List[float] = [0] * self.reader.csize

            for j in range(self.reader.csize):
                if skip:
                    skip = False
                    continue

                self.nlms[j] = self.nkmlookup(ls[j], ms[j], th0)
                tmp: List[float] = self.pm_n(ms[j], self.nlms[j], cth, self.tablesize)
                for _i in range(self.tablesize):
                    self.plmtable[_i][j] = tmp[_i]

                skip = False

                if ms[j] != 0 and ab[j] > 0:
                    self.plmtable[0][j + 1] = self.plmtable[0][j]
                    self.nlms[j + 1] = self.nlms[j]
                    skip = True

        nlm: float = self.nlms[index]
        colata: List[float] = [colat]

        tmp = [self.plmtable[i][index] for i in range(self.tablesize)]

        out = interpol_quad(tmp, self.colattable, colata)
        return out[0], nlm

    def mpfac(self, lat: float, mlt: float, fill: float) -> float:
        """
        Вычисление чеего-то в заданной точке
        :param lat: широта(градусы)
        :param mlt: долгтта(0-23 - часовой пояс?)
        :param fill: значение по умолчанию(нет аврорального овала)
        :return: fac:float
        """
        ls = self.reader.ls  # сокращения для констант из файла
        ms = self.reader.ms
        ab = self.reader.ab
        csize = self.reader.csize
        re: float = 6371.2 + 110.  # km radius (allow default ht=110) радиус Земли?

        inside: int

        cfactor: float

        phir: float
        plm: float
        colat: float

        inside, phir, colat = self.checkinputs(lat, mlt)

        if inside == 0:
            return fill

        phim: List[float] = [phir, phir * 2]
        cospm: List[float] = [cos(phi) for phi in phim]
        sinpm: List[float] = [sin(phi) for phi in phim]

        z: float = 0.
        skip: bool = False
        for j in range(csize):
            if skip:
                skip = False
                continue

            if ls[j] >= 11:
                break

            if ab[j] == 1:
                plm, nlm = self.scplm(j, colat)
                plm = plm * (nlm * (nlm + 1.))

                if ms[j] == 0:
                    z = z - plm * self.bsphc[j]
                else:
                    try:
                        z = z - (plm * (self.bsphc[j] * cospm[ms[j] - 1] + self.bsphc[j + 1] * sinpm[ms[j] - 1]))
                    except IndexError:
                        print(f"IndexError j={j} ms={ms} cospm={cospm}")
                        assert False
                    skip = True

        cfactor = -1.e5 / (4. * pi * re ** 2)  # convert to uA/m2
        z = z * cfactor
        return z

    def epotval(self, lat: float, mlt: float, fill: float) -> float:
        """
        Расчёт чего-то в заданной точке
        :param lat:широта(градусы)
        :param mlt: долгота(0-23 часовой пояс?)
        :param fill:значение по умолчанию (если нет аврорального овала)
        :return: epot:float (электрический потенциал?)
        """

        csize = self.reader.csize  # сокращения для констант из файла
        ms = self.reader.ms
        ab = self.reader.ab
        inside, phir, colat = self.checkinputs(lat, mlt)

        if inside == 0:
            return fill

        phim: List[float] = [phir, phir * 2]
        cospm: List[float] = [cos(phi) for phi in phim]
        sinpm: List[float] = [sin(phi) for phi in phim]

        z: float = 0.
        skip: bool = False
        for j in range(csize):
            if skip:
                skip = False
                continue

            m: int = ms[j]
            if ab[j] == 1:
                plm, _ = self.scplm(j, colat)
                skip = False
                if m == 0:
                    z = z + plm * self.esphc[j]
                else:
                    z = z + plm * (self.esphc[j] * cospm[m - 1] + self.esphc[j + 1] * sinpm[m - 1])
                    skip = True

        return z

    def setboundary(self, angle: float, bt: float, tilt: float, swvel: float, swden: float, file_path: str):
        """
        Инициализация модели: чтение констант из файла
        :param angle: угол ? магнитого поля? градусы
        :param bt: магнитное поле(?)
        :param tilt:угол наклона(градусы) чего?
        :param swvel:скорость соол. ветра
        :param swden: плотность сол. ветра
        :param file_path: путь к папке с файлами
        :return:
        """
        self.reader.read_bndy(os.path.join(file_path, 'W05scBndy.dat'))

        # Calculate the transformation matrix to the coordinate system
        # of the offset pole.
        xc: float = 4.2  # 4.2 градуса, константа. СМ 3 страница ПДФ
        theta: float = radians(xc)
        ct: float = cos(theta)
        st: float = sin(theta)

        self.tmat = [[ct, 0., st],
                     [0., 1., 0.],
                     [-st, 0., ct],
                     ]

        PSW: float = swden * swvel ** 2 * 1.6726e-6  # pressure swp давление солнечного ветра?
        self.tilt2: float = tilt ** 2
        cos_teta: float = cos(radians(angle))
        E_bt: float = 1. - exp(-bt * self.reader.ex_bndy[0])  # (3) страница 3 пдф btx E(Bt)
        if bt > 1.:
            E_bt = E_bt * bt ** self.reader.ex_bndy[1]
        else:
            cos_teta = 1. + bt * (cos_teta - 1.)  # remove angle dependency for IMF under 1 nT
        # endif
        x = [1., cos_teta, E_bt, E_bt * cos_teta, swvel, PSW]  # массив W формула (2) со страницы 3 пдф
        c = self.reader.bndya
        self.bndyfitr = sum([x_i * c_i for x_i, c_i in zip(x,
                                                           c)])  # R (1) стр 3 from Weimer-2005-Journal_of_Geophysical_Research%253A_Space_Physics_%25281978-2012%2529.pdf

    def setmodel(self, by: float, bz: float, tilt: float, swvel: float, swden: float, file_path: str,
                 model: str) -> None:
        """
        Инициализация
        :param by: проекции геомагнитного поля?
        :param bz:проекции геомагнитного поля?
        :param tilt: угол(?)
        :param swvel: скорость солнечного ветра(?)
        :param swden: плотность солнечного ветра(?)
        :param file_path: папка с исходными файлами
        :param model: название модели
        """

        assert model.strip() in ['epot', 'bpot'], "('>>> setmodel: model must be either epot or bpot')"

        if model.strip() == 'epot':
            self.reader.read_potential(os.path.join(file_path, 'W05scEpot.dat'))
        else:
            self.reader.read_potential(os.path.join(file_path, 'W05scBpot.dat'))

        self.reader.read_schatable(os.path.join(file_path, 'SCHAtable.dat'))

        bt: float = sqrt(by ** 2 + bz ** 2)
        angle: float = degrees(atan2(by, bz))  # градусы
        self.setboundary(angle, bt, tilt, swvel, swden, file_path)

        stilt: float = sin(radians(tilt))
        stilt2: float = stilt ** 2

        sw: float = bt * swvel / 1000.  # параметры солнечного ветра?
        swe: float = (1. - exp(-sw * self.reader.ex_pot[1])) * sw ** self.reader.ex_pot[0]
        swp: float = swvel ** 2 * swden * 1.6726e-6

        c0: float = 1.
        rang: float = radians(angle)  # радианы
        cosa: float = cos(rang)
        sina: float = sin(rang)
        cos2a: float = cos(2. * rang)
        sin2a: float = sin(2. * rang)

        if bt < 1.:  # remove angle dependency for IMF under 1 nT
            cosa = -1. + bt * (cosa + 1.)
            cos2a = 1. + bt * (cos2a - 1.)
            sina = bt * sina
            sin2a = bt * sin2a
            pass  # endif

        cfits: List[
            List[float]] = self.reader.schfits  # ! schfits(d1_pot, csize) is in module read_data коэффициенты модели?

        assert len(cfits) == self.reader.d1_pot, "len(self.reader.schfits)==self.reader.d1_pot"
        assert all(map(lambda l: len(l) == self.reader.csize,
                       cfits)), "len(self.reader.schfits[i])==self.reader.csize"

        a: List[float] = [c0, swe, stilt, stilt2, swp,
                          swe * cosa, stilt * cosa, stilt2 * cosa, swp * cosa,
                          swe * sina, stilt * sina, stilt2 * sina, swp * sina,
                          swe * cos2a, swe * sin2a]  # массив А (6) из пдф?

        result = np.dot(a, cfits)  # или это массив А из формулы (6)?

        if model.strip() == 'epot':
            self.esphc = result
        else:
            self.bsphc = result
