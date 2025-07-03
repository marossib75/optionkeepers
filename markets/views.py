from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from chains.query import *
from formulas import *
from utils.search import binary_search

from .query import *
from .serializers import *


@api_view(['GET'])
def get_markets(request):
    search = request.query_params.get('search')
    markets = select_markets(search)
    templates = {}

    for market in markets:
        template = market["template"]
        if template not in templates:
            templates[template] = {"markets": [], "template": template}

        templates[template]["markets"].append(market)

    serializer = GetTemplateSerializer(list(templates.values()), many=True)
    return Response(serializer.data)

# mobile
@api_view(['GET'])
def get_markets_search(request, s, mrkt):
    search = request.query_params.get('search')
    markets = select_markets_search(search, mrkt=mrkt)
    templates = {}

    for market in markets:
        template = market["template"]
        if template not in templates:
            templates[template] = {"markets": [], "template": template}
        if s.lower() in market['label'].lower() or s.lower() in market['symbol'].lower():
            templates[template]["markets"].append(market)

    serializer = GetTemplateSerializer(list(templates.values()), many=True)
    return Response(serializer.data)

# mobile
@api_view(['GET'])
def get_markets_paginated(request, mrkt, skip, limit):
    search = request.query_params.get('search')
    markets = select_markets_paginated(search, mrkt=mrkt, skip=skip, limit=limit)
    templates = {}

    for market in markets:
        template = market["template"]
        if template not in templates:
            templates[template] = {"markets": [], "template": template}

        templates[template]["markets"].append(market)

    serializer = GetTemplateSerializer(list(templates.values()), many=True)
    return Response(serializer.data)

# mobile
@api_view(['GET'])
def get_count_market_elements(request, mrkt):
    count = count_market_elements(mrkt=mrkt)

    return Response(count)

@api_view(['GET'])
def get_market(request, symbol):
    response = None
    market = select_market(symbol)

    if market is not None:
        serializer = GetMarketSerializer(market, allow_null=True)
        response = Response(serializer.data)

    else:
        response = Response({'message': "Market not found"}, status=status.HTTP_404_NOT_FOUND)

    return response

@api_view(['GET'])
def get_market_futures(request, symbol):
    userId = request.user.username
    strategyId = request.query_params.get('strategyId')
    futures = select_futures(symbol, userId, strategyId)
    serializer = GetMarketFutureSerializer(futures, allow_null=True, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_market_volatility(request, symbol):
    response = None
    expiration = request.query_params.get('expiration') or "EOM"
    limit = 2
    strikes = select_chain_options_by_expiration_per_strike(symbol, expiration, limit)

    if strikes is not None:
        data = {
            "symbol": symbol, 
            "expiration": expiration,
            "values": [],
        }
        price = None

        if len(strikes) > 0:

            for strike in strikes:

                if len(strike["options"]) == limit:
                    value = {"strike": strike["strike"], "lines": []}

                    for option in strike["options"]:
                        date = get_datetime_to_string(option["date"], format="%b %Y")
                        call_iv = get_implied_volatility(option["call"])
                        put_iv = get_implied_volatility(option["put"])

                        value["lines"].append({"label": f"CALL {date}", "vol":  call_iv * 100 if call_iv is not None else None})
                        value["lines"].append({"label": f"PUT {date}", "vol":  put_iv * 100 if put_iv is not None else None})
                        
                        if price is None or option["call"]["template"] == "index":
                            price = get_security_underlying_price(option["call"])

                    data["values"].append(value)

            data["index"] = binary_search(data["values"], price, "strike")

        serializer = GetMarketVolatilityPerStrikeSerializer(data, allow_null=True)
        response = Response(serializer.data)

    else:
        response = Response({'message': "Options by expiration per strike not found"}, status=status.HTTP_404_NOT_FOUND)
    return response

@api_view(['GET'])
def get_market_open_interest(request, symbol):
    response = None
    expiration = request.query_params.get('expiration') or "EOM"
    result = select_aggregated_oi_per_expiration(symbol, expiration)

    if result is not None:
        data = {}
        
        if len(result) > 0:
            data = result[0]
        
        else:
            data["values"] = []
            data["start"] = get_truncated_datetime()
            data["end"] = get_truncated_datetime()

        data["expiration"] = expiration
        serializer = GetMarketOpenInterestSerializer(data, allow_null=True)
        response = Response(serializer.data)
    
    else:
        response = Response({'message': "Open interests per expirations not found"}, status=status.HTTP_404_NOT_FOUND)
    return response

@api_view(['GET'])
def get_market_history(request, symbol):
    history = select_history_market(symbol)
    serializer = GetMarketHistorySerializer(history)
    return Response(serializer.data)

@api_view(['GET'])
def get_market_history_volatility(request, symbol):
    response = None

    history = select_history_market(symbol)

    if history is not None:
        historical_vol = get_historical_volatility(history)
        serializer = GetMarketHistoryVolatilitySerializer(historical_vol, many=True)
        response = Response(serializer.data)
    else:
        response = Response({'message': "Market not found"}, status=status.HTTP_404_NOT_FOUND)
    return response