import urllib


class Constants:
    by:float
    bz:float
    tilt:float


    swvel:float
    swden:float


class ConstantsStatic(Constants):
    def __init__(self):
        self.by=0
        self.bz=-5
        self.tilt=0

        self.swvel=450
        self.swden=9

class ConstantsTaken(Constants):
    def __init__(self):
        base_url:str = "https://services.swpc.noaa.gov/products/solar-wind/"
        mag_file:str="mag-1-day.json"
        plasma_file:str = "plasma-1-day.json"

        mag = urllib.urlopen(base_url+mag_file)
        plasma = urllib.urlopen(base_url+plasma_file)



