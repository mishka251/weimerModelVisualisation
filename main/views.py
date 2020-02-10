from typing import List, Tuple

from django.http import JsonResponse
from django.shortcuts import render
from .weimer.test import AuroraCalculator


# Create your views here.
def index(request):
    return render(request, 'index.html')


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
            # if matr[i][j] == 1e36:
            #    continue
            val = matr[i][j] if matr[i][j] != 1e36 else None
            obj = {'lng': x[i] - 180, 'lat': y[j], 'val': val}
            if matr[i][j] != 1e36:
                max_v = max(max_v, matr[i][j])
            min_v = min(min_v, matr[i][j])
            res.append(obj)

    return JsonResponse({'points': res, 'max': max_v, 'min': min_v})
