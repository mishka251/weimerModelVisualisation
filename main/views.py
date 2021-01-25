from typing import List, Tuple

from django.http import JsonResponse, HttpRequest
from django.shortcuts import render
from .weimer.test import AuroraCalculator
import numpy as np
from django.utils import timezone


# Create your views here.
def index(request):
    return render(request, 'weimer_index.html')


def get_matr(request: HttpRequest):
    type = request.GET.get('type')
    if type not in ['epot', 'mpfac']:
        return JsonResponse({'error': 'Incorrect type'})
    # filename: str = "wei05sc_epot_f90_big.dat" if type == 'epot' else "wei05sc_fac_f90_big.dat"
    date: timezone.datetime = timezone.datetime.strptime(request.GET.get('date'), '%Y-%m-%dT%H:%M:%S')
    date: timezone.datetime = timezone.datetime(date.year, date.month, date.day, date.hour, date.minute,
                                                tzinfo=timezone.utc)  # round time to minutes

    try:
        calucator = AuroraCalculator()
        n, m, x, y, matr, time = calucator.calc_epot(date) if type == 'epot' else calucator.calc_mpfac(
            date)  # read_data(filename)
    except ValueError as e:
        return JsonResponse({'error': e.args[0]})
    except Exception as e:
        return JsonResponse({'error': e.args[0]})
    res = []
    max_v = -1e36
    min_v = 1e36
    for i in range(n):
        for j in range(m):
            val = matr[i][j] if not np.isnan(matr[i][j]) else None
            obj = {'lng': x[i] - 180, 'lat': y[j], 'val': val}
            # print(obj)
            if val is not None:
                max_v = max(max_v, val)
                min_v = min(min_v, val)
            res.append(obj)

    return JsonResponse({'points': res, 'max': max_v, 'min': min_v, 'time': time}, safe=False)


def get_data_new_format(request: HttpRequest) -> JsonResponse:
    type = request.GET.get('type')
    if type not in ['epot', 'mpfac']:
        return JsonResponse({'error': 'Incorrect type'})
    # filename: str = "wei05sc_epot_f90_big.dat" if type == 'epot' else "wei05sc_fac_f90_big.dat"
    date: timezone.datetime = timezone.datetime.strptime(request.GET.get('tmstp'), '%Y-%m-%d-%H:%M')
    date: timezone.datetime = timezone.datetime(date.year, date.month, date.day, date.hour, date.minute,
                                                tzinfo=timezone.utc)  # round time to minutes

    try:
        calucator = AuroraCalculator()
        n, m, x, y, matr, time = calucator.calc_epot(date) if type == 'epot' else calucator.calc_mpfac(
            date)  # read_data(filename)
    except ValueError as e:
        return JsonResponse({'error': e.args[0]})
    except Exception as e:
        return JsonResponse({'error': e.args[0]})
    coords = []
    for i in range(n):
        for j in range(m):
            if np.isnan(matr[i][j]):
                continue
            val = matr[i][j]
            obj = [x[i] - 180, y[j], val]
            coords.append(obj)
    str_date = date.strftime('%Y-%m-%dT%H:%M:%SZ')
    data = {
        "Observation Time": str_date,
        "Forecast Time": str_date,
        "Data Format": f"[Longitude, Latitude, {type}]",
        "coordinates": coords
    }

    return JsonResponse(data, safe=False)
