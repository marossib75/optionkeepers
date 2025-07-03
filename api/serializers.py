from rest_framework import serializers
from .models import Strategia

class StrategiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Strategia
        fields = '__all__'
