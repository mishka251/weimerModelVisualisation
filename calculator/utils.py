from math import sqrt, factorial, log, exp
from typing import List


def value_locate(vec: List[float], val: float) -> int:
    if val < vec[0]:
        return -1
    if val > vec[-1]:
        return len(vec)
    for i in range(len(vec) - 1):
        if vec[i] <= val <= vec[i + 1]:
            return i


def interpol_quad(v: List[float], x: List[float], u: List[float]) -> List[float]:
    nv: int = len(v)
    nx: int = len(x)
    nu: int = len(u)
    p: List[float] = [0] * nu
    if nx != nv:
        print(f"('>>> interpol_quad: nx /= nv: nx='{nx}' nv='{nv})")

        return p
    for i in range(nu):
        ix: int = value_locate(x, u[i])
        if ix <= 1 or ix >= nx:  # ! bug fix by btf 12/23/09
            p[i] = 0
            continue  # cycle! bug fix by btf 12/23/09
        # endif
        x1: float = x[ix]
        x0: float = x[ix - 1]
        x2: float = x[ix + 1]
        p_i: float = v[ix - 1] * (u[i] - x1) * (u[i] - x2) / ((x0 - x1) * (x0 - x2)) + \
                     v[ix] * (u[i] - x0) * (u[i] - x2) / ((x1 - x0) * (x1 - x2)) + \
                     v[ix + 1] * (u[i] - x0) * (u[i] - x1) / ((x2 - x0) * (x2 - x1))

        p[i] = p_i
    return p


def lngamma(xx: float) -> float:
    # This is an f90-python translation from C code copied from
    # www.fizyka.umk.pl/nrbook/c6-1.pdf (numerical recipes gammln)
    x: float
    y: float
    tmp: float
    ser: float

    cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2,
           -0.5395239384953e-5]

    y = xx
    x = xx
    tmp = x + 5.5
    tmp = tmp - (x + 0.5) * log(tmp)
    ser = 1.000000000190015

    for j in range(len(cof)):
        y = y + 1
        ser = ser + cof[j] / y

    return -tmp + log(2.5066282746310005 * ser / x)


def km_n(m: int, rn: float) -> float:
    if m == 0:
        return 1

    return sqrt(2. * exp(lngamma(rn + m + 1.) - lngamma(rn - m + 1.))) / (2. ** m * factorial(m))
