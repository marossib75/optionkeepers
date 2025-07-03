from rest_framework import serializers
from .models import *


class GetMarketExpirationSerializer(serializers.Serializer):
    label = serializers.CharField(max_length=128)
    symbol = serializers.CharField(max_length=16)
    dates = serializers.ListField(child=serializers.DateTimeField(format="%Y-%m-%d", input_formats=["%Y-%m-%d"]))

    class Meta:
        fields = '__all__'


class GetMarketHistoryDaySerializer(serializers.Serializer):
    open = serializers.FloatField()
    high = serializers.FloatField()
    low = serializers.FloatField()
    close = serializers.FloatField()
    volume = serializers.IntegerField()
    openInterest = serializers.IntegerField()
    date = serializers.DateTimeField(format="%Y-%m-%d", input_formats=["%Y-%m-%d"])

    class Meta:
        fields = '__all__'


class GetMarketHistorySerializer(serializers.Serializer):
    exchange = serializers.CharField(max_length=16)
    symbol = serializers.CharField(max_length=16)
    days = serializers.ListField(child=GetMarketHistoryDaySerializer(), allow_null=True)

    class Meta:
        fields = '__all__'


class GetMarketHistoryVolatilitySerializer(serializers.Serializer):
    vol_21 = serializers.FloatField()
    vol_42 = serializers.FloatField()
    vol_63 = serializers.FloatField()
    date = serializers.DateTimeField(format="%Y-%m-%d", input_formats=["%Y-%m-%d"])

    class Meta:
        fields = '__all__'


class GetMarketFutureSerializer(serializers.Serializer):
    exchange = serializers.CharField(max_length=16)
    symbol = serializers.CharField(max_length=16)
    expiration = serializers.CharField(max_length=8)
    date = serializers.DateTimeField(format="%Y-%m-%d", input_formats=["%Y-%m-%d"])
    open = serializers.FloatField()
    high = serializers.FloatField()
    low = serializers.FloatField()
    last = serializers.FloatField()
    price = serializers.FloatField()
    settle = serializers.FloatField()
    close = serializers.FloatField()
    volume = serializers.IntegerField()
    openInterest = serializers.IntegerField()
    contract = serializers.CharField(max_length=64)
    quantity = serializers.IntegerField(allow_null=True)

    class Meta:
        fields = '__all__'


class GetMarketSerializer(serializers.Serializer):
    groupId = serializers.CharField(max_length=16)
    exchange = serializers.CharField(max_length=16)
    symbol = serializers.CharField(max_length=16)
    country = serializers.CharField(max_length=16)
    currency = serializers.CharField(max_length=8)
    label = serializers.CharField(max_length=256)
    template = serializers.CharField(max_length=16)
    exposition = serializers.IntegerField(allow_null=True)
    underlying = serializers.DictField()
    expirations = serializers.ListField(child=GetMarketExpirationSerializer(), allow_null=True)

    class Meta:
        fields = '__all__'


class GetTemplateSerializer(serializers.Serializer):
    template = serializers.CharField(max_length=16)
    markets = serializers.ListField(child=GetMarketSerializer(), allow_null=True)

    class Meta:
        fields = '__all__'

class GetMarketVolatilityPerStrikeSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    symbol = serializers.CharField(max_length=16)
    expiration = serializers.CharField(max_length=16)
    values = serializers.ListField(child=serializers.DictField(allow_null=True))

    class Meta:
        fields = '__all__'


class GetMarketOpenInterestExpirationSerializer(serializers.Serializer):
    date = serializers.DateTimeField(format="%Y-%m-%d", input_formats=["%Y-%m-%d"])
    totPut = serializers.IntegerField()
    totCall = serializers.IntegerField()
    diffPut = serializers.IntegerField()
    diffCall = serializers.IntegerField()

    class Meta:
        fields = '__all__'


class GetMarketOpenInterestSerializer(serializers.Serializer):
    expiration = serializers.CharField(max_length=16)
    values = serializers.ListField(child=GetMarketOpenInterestExpirationSerializer())
    start = serializers.DateTimeField(format="%Y-%m-%d", input_formats=["%Y-%m-%d"])
    end = serializers.DateTimeField(format="%Y-%m-%d", input_formats=["%Y-%m-%d"])

    class Meta:
        fields = '__all__'

