from django.db import models


# Create your models here.

class WeimerModelConstants(models.Model):
    datetime = models.DateTimeField(db_index=True, unique=True)
    plasma_speed = models.FloatField()
    plasma_density = models.FloatField()
    magnetic_by = models.FloatField()
    magnetic_bz = models.FloatField()

    class Meta:
        indexes = [models.Index(fields=['datetime'])]

    # @property
    # def pressure(self) -> float:
    #     """
    #     давление солнечного ветра?
    #     единицы измерения? единиц/c^2 *10^??
    #     :return:
    #     """
    #     return self.density * self.speed ** 2 * 1.6726e-6
