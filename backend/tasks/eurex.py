from .base import *
from .yahoo import get_yahoo_history, get_yahoo_underlying

base_url = "https://www.eurex.com/ex-en/markets"

eurex_fields = [
    {'name': 'last', 'id': 10},
    {'name': 'open', 'id': 2},
    {'name': 'close', 'id': None},
    {'name': 'settle', 'id': 13},
    {'name': 'ask', 'id': 7},
    {'name': 'askVol', 'id': 8},
    {'name': 'bid', 'id': 5},
    {'name': 'bidVol', 'id': 6},
    {'name': 'volume', 'id': 14},
    {'name': 'openInterest', 'id': 15},
    {'name': 'low', 'id': 4},
    {'name': 'high', 'id': 3},
]

eurex_future_fields = [
    {'name': 'last', 'id': 4},
    {'name': 'open', 'id': 1},
    {'name': 'close', 'id': 4},
    {'name': 'settle', 'id': 5},
    {'name': 'low', 'id': 3},
    {'name': 'high', 'id': 2},
    {'name': 'volume', 'id': 6},
    {'name': 'openInterest', 'id': 7},
    {'name': 'date', 'id': 0},
]

eurex_day_fields = [
    {'name': 'last', 'id': 4},
    {'name': 'open', 'id': 1},
    {'name': 'close', 'id': 4},
    {'name': 'settle', 'id': 5},
    {'name': 'low', 'id': 3},
    {'name': 'high', 'id': 2},
    {'name': 'volume', 'id': 6},
    {'name': 'openInterest', 'id': 7},
]

def get_eurex_market_futures(market):
    futures = []
    try:
        response = http_get(url=f'{base_url}/product!{market["futuresId"]}', allow_redirects=True)
        futures_response = []
        if response.status_code == 200:
            response = fromstring(response.content)
            futures_response = response.xpath('//table[@class="dataTable"]/tbody//tr')

            if len(futures_response) > 1:
                futures_response.pop()
                futures_response.pop()            

        for future_response in futures_response:

            if future_response is not None:
                future = {"exchange": market["exchange"], "symbol": market["symbol"], "expiration": "EOM"}
                data = future_response.xpath('td/text()')

                for field in eurex_future_fields:

                    if field["id"] is not None and field["id"] < len(data):
                        value = data[field["id"]] or ""
                        
                        if field["id"] == 0:
                            future[field["name"]] = get_string_to_datetime(value, format="%b %y")
                        else:
                            future[field["name"]] = get_round_price(value)
                
                if future["date"]:
                    next_month = future["date"].replace(day=28) + timedelta(days=4)
                    future["date"] = next_month - timedelta(days=next_month.day)
                    future["type"] = FUTURE
                    future["strike"] = 0
                    future["price"] = get_security_price(future)
                    future["contract"] = get_future_contract(future)
                    futures.append(future)

    except Exception as e:
        print("Error on get_eurex_market_futures")
        print(e)

    return futures

def get_eurex_market_product_expirations(market):
    expirations = []
    productId = None
    today = get_truncated_datetime()
    try:
        response = http_get(url=f'{base_url}/product!{market["chainsId"]}', allow_redirects=True)
        if response.status_code == 200:
            response = fromstring(response.content)
            elements = response.xpath('//input[@name="productId"]/@value')
            expirations_values = response.xpath('//select[@name="maturityDate"]/option/@value')
            
            if len(expirations_values) > 0:
                expirations_values.pop()
            
            for value in expirations_values:
                date = get_string_to_datetime(value, format="%Y%m")
                
                if date is not None:
                    third_friday = get_third_friday(date.year, date.month)
                    
                    if third_friday.date() > today.date():
                        code = value
                        label = get_datetime_to_string(third_friday, format="%b %Y")
                        expirations.append({'date': third_friday, 'label': label, 'code': code})

            productId = elements[0] if len(elements) > 0 else None

    except Exception as e:
        print("Error on get_eurex_market_product_expirations")
        print(e)

    return expirations, productId

def get_eurex_market_chain(market, expiration, productId, prod_expiration):

    chain = {
        'exchange': market["exchange"], 
        'symbol': market["symbol"], 
        'expiration': expiration["symbol"],
        'date': prod_expiration["date"],
        'options': []
    }

    try: 
        underlying_price = get_underlying_price(market["underlying"])
        options_rows= []

        for option_type in ['Call', 'Put']:
            response = http_get(url=f'{base_url}/idx/{productId}!quotesSingleViewOption', params={'callPut': option_type, 'maturityDate': prod_expiration["code"]})

            if response.status_code == 200:
                response = fromstring(response.content)
                rows = response.xpath('//table[@class="dataTable"]/tbody[starts-with(@id,"time")]/tr')
                rows.pop() # Tolgo l'ulitma riga dove sono salvati i totali
                options_rows.append(rows)
            
        if len(options_rows) == 2:

            for calls, puts in zip(options_rows[0], options_rows[1]):
                call_values = calls.xpath('td/span/text()')
                put_values = puts.xpath('td/span/text()')
            
                if len(call_values) > 0 and len(put_values) > 0 and call_values[0] == put_values[0]:
                    # Creo la option
                    strike_price = get_round_price(call_values[0], decimals=2) or 0
                    option = {
                        "strike": strike_price,
                        "state": get_strike_state(strike_price, underlying_price)
                    }
                
                    call = {}
                    put = {}
                    for field in eurex_fields:
                        if field["id"] is None:
                            call[field["name"]] = None
                            put[field["name"]] = None
                        else:
                            if field["id"] < len(call_values):
                                value = call_values[field["id"]]
                                call[field["name"]] = get_round_price(value)

                            if field["id"] < len(put_values):
                                value = put_values[field["id"]]
                                put[field["name"]] = get_round_price(value)

                    put["type"] = PUT
                    put["price"] = get_security_price(put)
                    put["state"] = get_option_state(underlying_price, option["strike"], put["type"])
                    put["contract"] = get_option_contract(chain, option["strike"], put["type"])

                    call["type"] = CALL
                    call["price"] = get_security_price(call)
                    call["state"] = get_option_state(underlying_price, option["strike"], call["type"])
                    call["contract"] = get_option_contract(chain, option["strike"], call["type"])

                    option["call"] = call
                    option["put"] = put
                    chain["options"].append(option)
    except Exception as e:
        print("Error on get_eurex_market_chain")
        print(e)

    return chain

@shared_task
def update_eurex():
    response = "Completed without exceptions"

    try:
        print("Update EUREX started")
        market_collection = db.market
        chain_collection = db.chain
        future_collection = db.future

        markets = get_markets_by_exchange("EUREX")

        for market in markets:
            futures = []
            underlying = {}

            if market["futuresId"] is not None:
                # Get futures
                futures = get_eurex_market_futures(market)

                for future in futures:
                    future_collection.replace_one(get_future_filter(future), future, upsert=True)

            if market["futuresId"] == market["id"]:
                # Get underlying from first future
                underlying = get_future_underlying(futures)

            elif market["outsourceId"] == market["id"]:
                # Get underlying from yahoo
                underlying = get_yahoo_underlying(market)

            market["underlying"] = underlying
            
            expiration = create_expiration("EOM", "End of month", [])

            if market["chainsId"] is not None:
                # Create only one expiration fo eurex

                # Get all expirations
                prod_expirations, productId = get_eurex_market_product_expirations(market)

                # Max number of expirations
                tot = min(len(prod_expirations), MAX_EXPIRATIONS)

                for prod_expiration in prod_expirations[0:tot]:
                    chain = get_eurex_market_chain(market, expiration, productId, prod_expiration)
                    chain["options"].sort(key=lambda o: o["strike"])
                    chain["index"] = get_underlying_strike_index(underlying, chain)

                    chain_collection.replace_one(get_chain_filter(chain), chain, upsert=True)
                    expiration["dates"].append(prod_expiration["date"])

            market["expirations"] = [expiration]
            market_collection.replace_one(get_market_filter(market), market, upsert=True)
        print("Update EUREX completed")

    except Exception as e:
        print("Exception handled on update_eurex")
        print(e)
        response = "Completed with exceptions"

    return response


# HISTORY

def get_eurex_market_info(market):
    dates = []
    productId = None
    productGroupId = None
    try:
        response = http_get(url=f'{base_url}/product!{market["id"]}', allow_redirects=True)
        if response.status_code == 200:
            response = fromstring(response.content)
            productId = response.xpath('//input[@name="productId"]/@value')[0]
            productGroupId = response.xpath('//input[@name="productGroupId"]/@value')[0]
            dates = response.xpath('//select[@name="busDate"]/option/@value')
    except Exception as e:
        print("Error on get_eurex_market_info")
        print(e)

    return productId, productGroupId, dates


def get_eurex_market_day(productId, productGroupId, date, tradeMonth):
    day = {"date": get_string_to_datetime(date, format="%Y%m%d")}

    try:
        params = {'productId': productId, 'productGroupId': productGroupId, 'busDate': date}
        response = http_get(url=f'{base_url}/idx/dax/{productId}!onlineStatsReload', params=params)
        if response.status_code == 200:
            response = fromstring(response.content)
            futures_response = response.xpath('//table[@class="dataTable"]/tbody//tr')
            # close_price_response = response.xpath('//div[@class="slot3"]/dl/dd/text()')
        
        future = []
        for future_response in futures_response:
            data = future_response.xpath('td/text()')
            
            if len(data) > 7:
                futureDate = get_string_to_datetime(data[0], format="%b %y")

                if futureDate and futureDate.month <= tradeMonth and futureDate.month >= tradeMonth:
                    future = future_response.xpath('td/text()') or []
                    break

        for field in eurex_day_fields:
            if field["id"] is not None and field["id"] < len(future):
                value = future[field["id"]]
                day[field["name"]] = get_round_price(value)
            else:
                day[field["name"]] = None

        day["price"] = get_security_price(day)

    except Exception as e:
        print("Error on get_eurex_market_day")
        print(e)

    return day


def get_eurex_history(market=None):
    history = {"exchange": market["exchange"], "symbol": market["symbol"], "days": []}
    try:

        if market["id"] == market["futuresId"]:
            tradeMonth = get_trade_month()
            productId, productGroupId, dates = get_eurex_market_info(market)

            for date in dates: 
                day = get_eurex_market_day(productId, productGroupId, date, tradeMonth)
                
                if day["date"]:
                    history["days"].append(day)

            history["days"].sort(key=lambda d: d["date"])

    except Exception as e:
        print("Error on get_eurex_history")
        print(e)

    return history

@shared_task
def update_eurex_history():

    outcome = "Completed without exceptions"

    try:
        print("Update EUREX history started")

        history_market_collection = db.history_market
        markets = get_markets_by_exchange("EUREX")

        for market in markets:
            history = get_eurex_history(market)
            yhistory = get_yahoo_history(market, history)
            
            if yhistory is not None:
                history["days"] = list(yhistory.values())
                history["days"].sort(key=lambda d: d["date"])

            history_market_collection.replace_one({"exchange": history["exchange"], "symbol": history["symbol"]}, history, upsert=True)
            
        print("Update EUREX history completed")
    except Exception as e:
        print("Exception handled on update_eurex_history")
        print(e)

        outcome = "Completed with exceptions"
    return outcome
