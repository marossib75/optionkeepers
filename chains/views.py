from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from formulas import *

from .query import *
from .serializers import *

@api_view(['GET'])
def chain(request, symbol, expiration=None, date=None):
    response = None
    userId = request.user.username
    strategyId = request.query_params.get('strategyId')

    chain = select_chain_options(symbol, expiration, date, userId, strategyId)

    if chain is not None:
        serializer = GetChainSerializer(chain, allow_null=True)
        response = Response(serializer.data)
    else:
        response = Response({'message': "Chain not found"}, status=status.HTTP_404_NOT_FOUND)
    return response


@api_view(['GET'])
def get_open_interest(request, symbol, expiration, date):
    response = None

    chain = select_chain(symbol, expiration, date)
    
    if chain is not None:
        result = select_aggregated_oi_per_strike(symbol, expiration, date)

        data = {}
        if result is not None and len(result) > 0:
            data = result[0]
        else:
            data["values"] = []
            data["start"] = get_truncated_datetime()
            data["end"] = get_truncated_datetime()

        data["index"] = chain["index"]
        data["expiration"] = expiration
        data["date"] = date
        serializer = GetChainOpenInterestSerializer(data, allow_null=True)
        response = Response(serializer.data)

    else:
        response = Response({'message': "Chain not found"}, status=status.HTTP_404_NOT_FOUND)
    return response


@api_view(['GET'])
def get_open_interest_cumulative(request, symbol, expiration, date):
    response = None

    chain = select_chain(symbol, expiration, date)
    
    if chain is not None:
        data = {
            "symbol": symbol,
            "expiration": expiration,
            "date": date,
            "index": chain["index"],
            "values": get_chain_oi_cumulative(chain)
        }
        serializer = GetChainOpenInterestCumulativeSerializer(data, allow_null=True)
        response = Response(serializer.data)

    else:
        response = Response({'message': "Chain not found"}, status=status.HTTP_404_NOT_FOUND)
    return response


@api_view(['GET'])
def get_volatility_variation(request, symbol, expiration, date):
    response = None

    history = select_history_chain(symbol, expiration, date)

    if history is not None:

        data = {"symbol": symbol, "expiration": expiration, "date": date}
        
        if history is not None and "first" in history and "last" in history:

            first = history["first"]
            last = history["last"]

            if first is not None and last is not None:
                data["start"] = first["date"]
                data["end"] = last["date"]
                data["index"] = last["index"]
                data["variations"] = get_options_volatility_variation( last["options"], first["options"])

            else:
                data["start"] = get_truncated_datetime()
                data["end"] = get_truncated_datetime()
                data["variations"] = []

        serializer = GetChainVolatilityVariationSerializer(data, allow_null=True)
        response = Response(serializer.data)

    else:
        response = Response({'message': "Histoy chain not found"}, status=status.HTTP_404_NOT_FOUND)
    return response