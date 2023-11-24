from django.contrib.gis.db import models
# from django.db import models


class Aimag(models.Model):
    class Meta:
        db_table = 'aimag'
        managed = False

    id = models.IntegerField(primary_key=True, auto_created=True)
    geom = models.GeometryField(max_length=255, verbose_name='Геом')


# Create your models here.
class LineStrings(models.Model):

    class Meta:
        db_table = 'erdenet'
        managed = False

    id = models.IntegerField(primary_key=True, auto_created=True)
    name = models.CharField(max_length=255, verbose_name='Нэр')
    geom = models.GeometryField(max_length=255, verbose_name='Геом')


class Points(models.Model):

    class Meta:
        db_table = 'distance'
        managed = False

    id = models.IntegerField(primary_key=True, auto_created=True)
    name = models.CharField(max_length=255, verbose_name='Нэр')
    geom = models.GeometryField(max_length=255, verbose_name='Геом')


class Entry(models.Model):

    point = models.PointField()

    @property
    def lat_lng(self):
        return list(getattr(self.point, 'coords', [])[::-1])


class Ad(models.Model):
    aimag = models.ForeignKey(Aimag, on_delete=models.CASCADE)
    location = models.PointField()


class Home(models.Model):
    class Meta:
        db_table = 'home'
        managed = False
    
    name = models.CharField(max_length=255, verbose_name='Нэр')
    geom = models.GeometryField(max_length=255, verbose_name='Геом')