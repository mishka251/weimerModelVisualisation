from typing import List, TextIO
import numpy as np


# Data read from W05scEpot.dat or W05scBpot.dat:

class Reader(object):
    csize: int = 28  # const
    d1_pot: int = 15  # const
    d2_pot: int = 18  # const

    ab: List[int] = []  # np.zeros(csize)
    ls: List[int] = []  # np.zeros(csize)
    ms: List[int] = []  # np.zeros(csize)

    alschfits: List[List[float]] = []
    schfits: List[List[float]] = []
    ex_pot: List[float] = np.zeros(2, np.float)

    maxl_pot: int
    maxm_pot: int

    # Data read from SCHAtable.dat:

    d1_scha: int = 19  # const
    d2_scha: int = 7  # const
    d3_scha: int = 68  # const

    allnkm: List[List[List[float]]] = np.zeros((d1_scha, d2_scha, d3_scha), np.float)

    maxk_scha: int
    maxm_scha: int

    th0s: List[float] = np.zeros(d3_scha)

    # Data read from W05scBndy.dat:

    na: int = 6  # const
    nb: int = 7  # const

    bndya: List[float] = []  # np.zeros(na)
    bndyb: List[float] = []  # np.zeros(nb)
    ex_bndy: List[float] = []  # np.zeros(2)

    def read_1dim_array(self, file: TextIO, length: int, T: type) -> List:
        result = []
        while len(result) < length:
            result.extend([T(char) for char in file.readline().strip().split() if char != ''])
        return result

    def read_2dim_array(self, file: TextIO, length_1dim: int, length_2dim: int, T: type) -> List[List]:
        result = []
        for i in range(length_2dim):
            result.append([])

        col = []
        while len(result[0]) < length_1dim:

            elements = [T(digit) for digit in file.readline().strip().split(' ') if digit != '']
            col.extend(elements)

            if len(col) == length_2dim:
                for i in range(length_2dim):
                    result[i].append(col[i])
                col = []

        return result

    def read_potential(self, infile: str):
        """
         Read ascii data file W05scEpot.dat or W05scBpot.dat, written by
        pro write_potential (write_data.pro)
        """

        file: TextIO = open(infile)

        _: str = file.readline()

        self.ab: List[int] = [int(digit) for digit in file.readline().strip().split(' ') if digit != '']

        [csize_rd, d1_rd, d2_rd] = [int(digit) for digit in file.readline().strip().split(' ')]

        assert csize_rd == self.csize, \
            f"('read_potential: file '{infile}': incompatable csize: 'csize_rd=',{csize_rd},' csize=',{self.csize})"

        assert d1_rd == self.d1_pot, \
            f"(' read_potential: file '{infile}': incompatable d1: 'd1_rd=',{d1_rd},' d1_pot='{self.d1_pot})"

        assert d2_rd == self.d2_pot, \
            f"(' read_potential: file '{infile}': incompatable d2: ','d2_rd='{d2_rd}' d2_pot='{self.d2_pot})"

        self.alschfits = self.read_2dim_array(file, self.csize, self.d2_pot, float)  # []

        self.ex_pot = [float(digit) for digit in file.readline().strip().split(' ') if digit != '']

        self.ls = self.read_1dim_array(file, self.csize, int)  # []

        [self.maxl_pot, self.maxm_pot] = [int(l) for l in file.readline().strip().split() if l != '']

        self.ms = self.read_1dim_array(file, self.csize, int)  # []

        assert len(self.ls) == self.csize, "ls!=csize"
        assert len(self.ms) == self.csize, "ms!=csize"
        self.schfits = self.read_2dim_array(file, self.csize, self.d1_pot, float)  # []

        file.close()
        #print(f"file {infile} readed")

    def read_schatable(self, infile: str):
        file = open(infile)
        _: str = file.readline()

        [self.maxk_scha, self.maxm_scha] = [int(char) for char in file.readline().strip().split() if char != '']

        for i in range(self.d3_scha):
            for j in range(self.d2_scha):
                col = []
                while len(col) < self.d1_scha:
                    col.extend([float(char) for char in file.readline().strip().split() if char != ''])
                for k in range(self.d1_scha):
                    self.allnkm[k][j][i] = col[k]

        assert len(self.allnkm) == self.d1_scha, "d1_scha"
        assert all(map(lambda l: len(l) == self.d2_scha, self.allnkm)), "d2_scha"
        assert all(map(lambda l2: all(map(lambda l: len(l) == self.d3_scha, l2)), self.allnkm)), "d3_scha"

        self.th0s = self.read_1dim_array(file, self.d3_scha, float)

        assert len(self.th0s) == self.d3_scha, "th0s"
        #print(f"file {infile} readed")

    def read_bndy(self, infile: str):
        file = open(infile)

        _: str = file.readline()
        [rd_na, rd_nb] = [int(char) for char in file.readline().strip().split() if char != '']

        assert rd_na == self.na, \
            f"('read_potential: file '{file}': incompatable na: ','rd_na='{rd_na}' na=',{self.na})"

        assert rd_nb == self.nb, \
            f"('>>> read_potential: file '{file}': incompatable nb: ','rd_nb='{rd_nb}' nb={self.nb})"

        self.bndya = [float(char) for char in file.readline().strip().split() if char != '']
        assert len(self.bndya) == self.na

        self.bndyb = [float(char) for char in file.readline().strip().split() if char != '']
        assert len(self.bndyb) == self.nb

        self.ex_bndy = [float(char) for char in file.readline().strip().split() if char != '']
        assert len(self.ex_bndy) == 2

        file.close()
        #print(f"file {infile} readed")
