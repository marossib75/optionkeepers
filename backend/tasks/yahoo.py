from .base import *

y_underlying_fields = [
    {'name': 'last', 'id': 'regularMarketPrice'},
    {'name': 'open', 'id': 'regularMarketOpen'},
    {'name': 'close', 'id': 'regularMarketPreviousClose'},
    {'name': 'settle', 'id': None},
    {'name': 'low', 'id': 'regularMarketDayLow'},
    {'name': 'high', 'id': 'regularMarketDayHigh'},
    {'name': 'volume', 'id': 'volume'},
    {'name': 'openInterest', 'id': 'openInterest'},
]
y_day_fields = [
    {'name': 'last', 'id': 'last'},
    {'name': 'open', 'id': 'open'},
    {'name': 'close', 'id': 'close'},
    {'name': 'settle', 'id': None},
    {'name': 'low', 'id': 'low'},
    {'name': 'high', 'id': 'high'},
    {'name': 'volume', 'id': 'volume'},
    {'name': 'openInterest', 'id': None}
]

def get_yahoo_history(market, history):
    yhistory = None
    
    if market["outsourceId"] is not None and market["outsourceId"] != "":
        end_time = get_truncated_datetime()
        start_time = end_time - timedelta(days=450)
        end = end_time.strftime('%Y-%m-%d')
        start = start_time.strftime('%Y-%m-%d')

        json_prices = YahooFinancials(market["outsourceId"]).get_historical_price_data(start, end, 'daily')
        prices = json_prices[market["outsourceId"]]['prices']

        if len(prices) > 0:
            yhistory = {}
            for price in prices:
                formatted_date = price["formatted_date"]
                day = {
                    'date': get_string_to_datetime(formatted_date),
                }
                for field in y_day_fields:
                    if field["id"] is not None and field["id"] in price:
                        day[field["name"]] = price[field["id"]]
                    else:
                        day[field["name"]] = None
                        
                day["price"] = get_security_price(day)
                yhistory[formatted_date] = day

    if yhistory is not None and history is not None:
        for day in history["days"]:
            date = get_datetime_to_string(day["date"])
            if date in yhistory:
                yhistory[date]["openInterest"] = day["openInterest"]

    return yhistory

def get_yahoo_underlying(market):
    underlying = {}

    if market["outsourceId"] is not None and market["outsourceId"] != "":
        data = YahooFinancials(market["outsourceId"]).get_stock_price_data()
        data = data[market["outsourceId"]]
    
        for field in y_underlying_fields:
            if field["id"] is not None and field["id"] in data:
                underlying[field["name"]] = data[field["id"]]
            else:
                underlying[field["name"]] = None

    underlying["price"] = get_underlying_price(underlying)

    return underlying