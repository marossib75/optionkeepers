from importlib_metadata import metadata
from rest_framework import serializers, status
from django.contrib.auth.models import User

from tasks import OPEN, TEMP, ADD, CLOSE, DELETE, UPDATE

from .models import *

# Users

class GetUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name']

class GetSearchedUserSerializer(serializers.Serializer):
    _id = serializers.CharField(max_length=128)
    username = serializers.CharField(max_length=128)
    email = serializers.CharField(max_length=128)

    class Meta:
        fields = '__all__'

# Portfolio
class StrategySerializer(serializers.Serializer):
    _id = serializers.CharField(max_length=128)
    group = serializers.DictField()
    stats = serializers.DictField()
    total = serializers.IntegerField()
    disabled = serializers.BooleanField()
    name = serializers.CharField(max_length=128)
    created = serializers.DateTimeField(format="%Y-%m-%d")

    class Meta:
        fields = '__all__'

class GetPortfolioSerializer(serializers.Serializer):
    _id = serializers.CharField(max_length=128)
    userId = serializers.CharField(max_length=128)
    name = serializers.CharField(max_length=128)
    currency = serializers.CharField(max_length=8)
    value = serializers.FloatField(allow_null=True)
    stats = serializers.DictField()
    strategies = StrategySerializer(many=True, allow_null=True)

    class Meta:
        fields = '__all__'

# Strategies

class PostStrategiesSerializer(serializers.Serializer):
    groupId = serializers.CharField(max_length=16)
    name = serializers.CharField(max_length=128)
    published = serializers.BooleanField()
    
    class Meta:
        fields = '__all__'

class GetStrategiesSerializer(serializers.Serializer):
    _id = serializers.CharField(max_length=128)
    userId = serializers.CharField(max_length=128, required=False)
    groupId = serializers.CharField(max_length=16)
    name = serializers.CharField(max_length=128)
    published = serializers.BooleanField(required=False)
    upvotes = serializers.IntegerField(required=False)
    bookmarks= serializers.IntegerField(required=False)
    stats = serializers.DictField(required=False)
    country = serializers.CharField(max_length=256, required=False)
    from_user = serializers.CharField(max_length=128, allow_null = True, required=False)

    class Meta:
        fields = '__all__'

class GetStrategiesPaginatedSerializer(serializers.Serializer):
    metadata = serializers.ListField()
    data = GetStrategiesSerializer(many=True, allow_null=True)

# Strategy

# Strategy order

class WhatIfSerializer(serializers.Serializer):
    active = serializers.BooleanField(required=False)
    quantity = serializers.IntegerField(required=False)
    price = serializers.FloatField(required=False)
    startPrice = serializers.FloatField(required=False)
    endPrice = serializers.FloatField(required=False)
    volatility = serializers.FloatField(required=False)

    class Meta:
        fields = '__all__'

class OrderSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=64)
    operation = serializers.CharField(max_length=16)
    contract = serializers.CharField(max_length=64)
    status = serializers.CharField(required=False, max_length=16)
    active = serializers.BooleanField(required=False)
    quantity = serializers.IntegerField(required=False)
    price = serializers.FloatField(required=False)
    startPrice = serializers.FloatField(required=False)
    whatif = WhatIfSerializer(required=False)
    
    def validate_status(self, value):
        """
        Check that the status is 'temporary', 'open' or 'close'
        """
        value = value.lower()
        if value != TEMP and value != OPEN and value != CLOSE:
            raise serializers.ValidationError("Status value is not valid")
        return value

    def validate_operation(self, value):
        """
        Check that the operation is 'add', 'update', 'delete'
        """
        value = value.lower()
        if value != ADD and value != UPDATE and value != DELETE:
            raise serializers.ValidationError("Operation value is not valid")
        return value
    
    def validate(self, data):
        """
        Check if the operation is "add" or "update" and quantity greater then 0
        """
        quantity = data["quantity"] if "quantity" in data else 0
        operation = data["operation"] if "operation" in data else ""
        operation = operation.lower()

        if operation == ADD and quantity == 0:
            raise serializers.ValidationError("Quantity value is invalid for the operation specified")

        return data

    class Meta:
        fields = '__all__'

class PostStrategySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=128, allow_null=True)
    published = serializers.BooleanField(required=False, allow_null=True)
    orders = serializers.ListField(child=OrderSerializer(), allow_null=True)
    whatif = serializers.DictField(required=False, allow_null=True)
    disabled = serializers.BooleanField(required=False, allow_null=True)

    class Meta:
        fields = '__all__'

# Strategy position
class PositionSerializer(serializers.Serializer):

    # Fiealds related to position saved into strategy collection
    id = serializers.CharField(max_length=64)
    contract = serializers.CharField(max_length=64)
    exchange = serializers.CharField(max_length=8)
    symbol = serializers.CharField(max_length=8)
    expiration = serializers.CharField(max_length=8)
    date = serializers.DateTimeField()
    status = serializers.CharField(max_length=8)
    active = serializers.BooleanField()
    strike = serializers.FloatField()
    type = serializers.CharField(max_length=8)
    quantity = serializers.IntegerField()
    startPrice = serializers.FloatField(required=False)
    endPrice = serializers.FloatField(required=False)
    startDate = serializers.DateTimeField(required=False)
    endDate = serializers.DateTimeField(required=False)
    whatif = serializers.DictField(required=False)

    # From market and chain or future (not saved into strategy collection)
    label = serializers.CharField(allow_null=True,max_length=256)
    currency = serializers.CharField(allow_null=True, max_length=8)
    state = serializers.CharField(required=False, allow_null=True, max_length=8) 
    last = serializers.FloatField(required=False, allow_null=True)
    price = serializers.FloatField(required=False, allow_null=True)
    close = serializers.FloatField(required=False, allow_null=True)
    settle = serializers.FloatField(required=False, allow_null=True)
    volume = serializers.IntegerField(required=False, allow_null=True)
    openInterest = serializers.IntegerField(required=False, allow_null=True)
    volatility = serializers.DecimalField(required=False, allow_null=True, decimal_places=3, max_digits=10)
    timeValue = serializers.DecimalField(required=False, allow_null=True, decimal_places=3, max_digits=10)
    cost = serializers.FloatField(required=False, allow_null=True)
    possibleROI = serializers.FloatField(required=False, allow_null=True)
    effectiveROI = serializers.FloatField(required=False, allow_null=True)

    class Meta:
        fields = '__all__'


class GetStrategySerializer(serializers.Serializer):
    _id = serializers.CharField(max_length=128)
    userId = serializers.CharField(max_length=128, required=False)
    name = serializers.CharField(max_length=128)
    published = serializers.BooleanField(required=False)
    upvotes = serializers.ListField(required=False)
    bookmarks = serializers.ListField(required=False)
    price = serializers.DecimalField(decimal_places=4, max_digits=10)
    group = serializers.DictField()
    stats = serializers.DictField()
    whatif = serializers.DictField()
    markets = serializers.ListField(child=serializers.DictField())
    positions = serializers.ListField(child=PositionSerializer())
    
    class Meta:
        fields = '__all__'

# Strategy profit

class GetStrategyProfitSerializer(serializers.Serializer):
    isWhatif = serializers.BooleanField()
    index = serializers.IntegerField()
    price = serializers.DecimalField(decimal_places=4, max_digits=10)
    profits = serializers.ListField(child=serializers.DictField())
    
    class Meta:
        fields = '__all__'


# Strategy greeks

class GetStrategyGreeksSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    price = serializers.DecimalField(decimal_places=4, max_digits=10)
    greeks = serializers.ListField(child=serializers.DictField())
    
    class Meta:
        fields = '__all__'


# Links
class LinkSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=128)
    url = serializers.CharField()

    class Meta:
        fields = '__all__'


# Clubs
class GetClubsSerializer(serializers.Serializer):
    _id = serializers.CharField(max_length=128)
    creator_userId = serializers.CharField(max_length=128)
    name = serializers.CharField(max_length=128)
    img_path= serializers.CharField(max_length=128)
    members = serializers.IntegerField()
    nstrategies= serializers.IntegerField()
    description = serializers.CharField(max_length=256)
    created = serializers.DateTimeField(format="%Y-%m-%d")
    published = serializers.BooleanField()
    upvotes = serializers.ListField()

    class Meta:
        fields = '__all__'

class GetClubsPaginatedSerializer(serializers.Serializer):
    metadata = serializers.ListField()
    data = GetClubsSerializer(many=True, allow_null=True)

class GetClubSerializer(serializers.Serializer):
    _id = serializers.CharField(max_length=128)
    creator_userId = serializers.CharField(max_length=128)
    name = serializers.CharField(max_length=128)
    img_path= serializers.CharField(max_length=128)
    members = serializers.IntegerField()
    members_list = serializers.ListField()
    nstrategies= serializers.IntegerField()
    description = serializers.CharField(max_length=256)
    created = serializers.DateTimeField(format="%Y-%m-%d")
    published = serializers.BooleanField()
    upvotes = serializers.ListField()
    admins = serializers.ListField()
    links = LinkSerializer(many=True, allow_null=True)
    strategies = GetStrategiesSerializer(many=True, allow_null=True)

    class Meta:
        fields = '__all__'

class PostClubSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=128)
    published= serializers.BooleanField()
    description = serializers.CharField(max_length=256, allow_blank=True)
    img_path = serializers.CharField(allow_blank=True)
    links = LinkSerializer(many=True)
    
    class Meta:
        fields = '__all__'
