from rest_framework import serializers

class GetGroupsSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=16)
    name = serializers.CharField(max_length=128)
    type = serializers.CharField(max_length=32)

    class Meta:
        fields = '__all__'

class GetExchangesSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=16)
    name = serializers.CharField(max_length=128)
    days = serializers.ListField(child=serializers.IntegerField())
    hours = serializers.ListField(child=serializers.ListField(child=serializers.IntegerField()))

    class Meta:
        fields = '__all__'