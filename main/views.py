from typing import List, Tuple

from django.http import JsonResponse
from django.shortcuts import render
from .weimer.test import AuroraCalculator


# Create your views here.
def index(request):
    return render(request, 'index.html')


def read_data(filename: str) -> Tuple[int, int, List[float], List[float], List[List[float]]]:
    file = open("main/data_files/" + filename)
    n: int
    m: int

    [n, m] = [int(s) for s in file.readline().split()]

    x = []
    for i in range(n):
        x.append(float(file.readline()))

    y = []
    for i in range(m):
        y.append(float(file.readline()))

    matr = []
    for i in range(n):
        matr.append([float(s) for s in file.readline().split()])

    return n, m, x, y, matr


def get_matr(request):
    type = request.GET.get('type', "epot")
    # filename: str = "wei05sc_epot_f90_big.dat" if type == 'epot' else "wei05sc_fac_f90_big.dat"

    calucator = AuroraCalculator()

    n, m, x, y, matr = calucator.calc_epot() if type == 'epot' else calucator.calc_mpfac()  # read_data(filename)

    res = []
    max_v = -1e36
    min_v = 1e36
    for i in range(n):
        for j in range(m):
            if matr[i][j] == 1e36:
                continue
            obj = {'lng': x[i] - 180, 'lat': y[j], 'val': matr[i][j]}
            max_v = max(max_v, matr[i][j])
            min_v = min(min_v, matr[i][j])
            res.append(obj)

    return JsonResponse({'points': res, 'max': max_v, 'min': min_v})
