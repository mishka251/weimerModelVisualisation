from typing import List, Tuple

from django.http import JsonResponse
from django.shortcuts import render


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
    filename: str = "wei05sc_epot_f90.dat" if type == 'epot' else "wei05sc_fac_f90.dat"

    n, m, x, y, matr = read_data(filename)

    return JsonResponse({'n':n, 'm':m, 'x': x, 'y': y, 'matr': matr})
