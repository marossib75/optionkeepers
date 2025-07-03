from rest_framework import serializers
from .models import *

class GetChainSerializer(serializers.Serializer):
    exchange = serializers.CharField(max_length=16)
    symbol = serializers.CharField(max_length=16)
    expiration = serializers.CharField(max_length=16)
    date = serializers.DateTimeField(format="%Y-%m-%d")
    index = serializers.IntegerField()
    underlying = serializers.DictField()
    options = serializers.ListField(child=serializers.DictField())

    class Meta:
        fields = '__all__'

class GetChainOpenInterestSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    expiration = serializers.CharField(max_length=16)
    date = serializers.DateTimeField(format="%Y-%m-%d")
    start = serializers.DateTimeField(format="%Y-%m-%d")
    end = serializers.DateTimeField(format="%Y-%m-%d")
    values = serializers.ListField(child=serializers.DictField())


    class Meta:
        fields = '__all__'

class GetChainOpenInterestCumulativeSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    symbol = serializers.CharField(max_length=16)
    expiration = serializers.CharField(max_length=16)
    date = serializers.DateTimeField(format="%Y-%m-%d")
    values = serializers.ListField(child=serializers.DictField())

    class Meta:
        fields = '__all__'

class GetChainVolatilityVariationSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    symbol = serializers.CharField(max_length=16)
    expiration = serializers.CharField(max_length=16)
    date = serializers.DateTimeField(format="%Y-%m-%d")
    start = serializers.DateTimeField(format="%Y-%m-%d")
    end = serializers.DateTimeField(format="%Y-%m-%d")
    variations = serializers.ListField(child=serializers.DictField())


    class Meta:
        fields = '__all__'