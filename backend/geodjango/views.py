import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from rest_framework_gis.filters import InBBoxFilter

from django.contrib.gis.geos import (
    Point,
    LineString
)

from django.contrib.gis.measure import Distance

def json_load(data):
    if isinstance(data, str):
        data = json.loads(data)
    return data

from .models import (
    Aimag,
    Points,
    Ad,
    Home
)

def coordinate_to_point(coordinate, srid=4326):
    """ координат to Point руу хөрвүүлэх """

    geom = None
    if isinstance(coordinate, list):
        geom = Point(coordinate, srid=srid)

    return geom


def get_geojson_to_geom(geom):
    """ geom to geojson """
    point_json = {}

    if geom:
        point_json = json_load(geom.json)

    return point_json


def make_lines(point1, point2):

    line = LineString(point1, point2)
    return line

# 2 цэгийн хооронд дахь зай км
def get_distance():
    end =  Points.objects.last()
    start =  Points.objects.first()

    p1 = start.geom
    p2 = end.geom

    distance = p1.distance(p2)
    distance_in_km = distance * 100

    print(distance_in_km)
    

# Энэ цэг аль аймагт багтаж байгаа вэ
def check_contains_point():
    point =  Points.objects.last()

    aimag_geom = Aimag.objects.filter(geom__contains=point.geom)

    # Цэгийн дав
    aimag_geom_crosses = Aimag.objects.filter(geom__bboverlaps=point.geom)


def get_aimag():

    aimag_list = list(Aimag.objects.values('id', 'geom'))

    for item in aimag_list:
        geom = item.get('geom')
        item['geo_json'] = json_load(geom)
    
    return JsonResponse(
        {
            'success': True,
            'data': aimag_list
        }
    )

class AimagApiView(View):

    @csrf_exempt
    def get(self, request):
        aimag = Aimag.objects.filter(id=12).first()
        # home = Home.objects.first()
    
        data = json_load(aimag.geom.json)
        
        return JsonResponse(
            {
                'success': True,
                'data': data
            }
        )

class AimagAllApiView(View):

    @csrf_exempt
    def get(self, request):
        aimags = Aimag.objects.all()
    
        for aimag in aimags:
            print()
        
        return JsonResponse(
            {
                'success': True,
                'data': data
            }
        )


class AdView(View):

    bbox_filter_field = 'location'
    filter_backend = (InBBoxFilter)
    queryset = Ad.objects.all()

    def get(self, request):
        points = request.GET['in_bbox']
        print(points)
