from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Strategia
from .serializers import StrategiaSerializer

@api_view(["GET", "POST"])
def strategie_view(request):
    if request.method == "GET":
        strategie = Strategia.objects.all()
        serializer = StrategiaSerializer(strategie, many=True)
        return Response(serializer.data)
    
    if request.method == "POST":
        serializer = StrategiaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
