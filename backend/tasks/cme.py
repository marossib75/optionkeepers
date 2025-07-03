from .base import *
from .yahoo import get_yahoo_underlying, get_yahoo_history

base_url = 'https://www.cmegroup.com/CmeWS/mvc'
headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36'}

cme_fields = [
    { "name": "last", "id": "last" },
    { "name": "open", "id": "open" },
    { "name": "close", "id": "close" },
    { "name": "settle", "id": "priorSettle"},
    { "name": "ask", "id": "ask"},
    { "name": "askVol", "id": "ask_size"},
    { "name": "bid", "id": "bid"},
    { "name": "bidVol", "id": "bid_size"},
    { "name": "volume", "id": "volume"},
    { "name": "low", "id": "low" },
    { "name": "high", "id": "high" },
]

cme_futures_fields = [
    { "name": "last", "id": "last" },
    { "name": "open", "id": "open" },
    { "name": "close", "id": "last" },
    { "name": "settle", "id": "priorSettle" },
    { "name": "low", "id": "low" },
    { "name": "high", "id": "high" },
    { "name": "volume", "id": "volume" },
    { "name": "openInterest", "id": None },
    { "name": "date", "id": None },
]

cme_day_fields = [
    { "name": "last", "id": "last" },
    { "name": "open", "id": "open" },
    { "name": "close", "id": "last" },
    { "name": "settle", "id": "priorSettle" },
    { "name": "low", "id": "low" },
    { "name": "high", "id": "high" },
    { "name": "volume", "id": "volume" },
]

def get_cme_market_date(label, optionType):
    date = None
    today = datetime.today()

    try:
        if label.startswith("Week"):
            label_week, label_month = label.split("-")
            month_week_id = int(label_week.replace("Week", "")) - 1

            year = today.year
            month = get_string_to_datetime(f'{label_month.capitalize()} {year}', format="%b %Y")
            year_week_id = month.isocalendar()[1] + month_week_id

            date = get_string_to_datetime(f'{year} {year_week_id} 5', format="%Y %W %w")

        elif label.startswith("Day"):
            if len(label) == 3:
                date = today
            else:
                year = today.year
                day_id = int(label.replace("Day", ""))
                date = get_string_to_datetime(f'{today.year} {today.month} {day_id}', format="%Y %m %d")
        else:
            monthDate = get_string_to_datetime(label, format="%b %Y")
            
            if optionType == "AME":
                date = get_third_friday(monthDate.year, monthDate.month)
    
            else:
                nextMonthDate = monthDate.replace(day=28) + timedelta(days=4)
                date = nextMonthDate - timedelta(days=nextMonthDate.day)

    except Exception as e:
        print("Error on get_cme_market_date")
        print(e)

        date = None

    return date

def get_cme_market_products(market):
    products = []
    today = get_truncated_datetime()
    try:
        response = http_get(url=f'{base_url}/Options/Categories/List/{market["chainsId"]}/G', params={'_': get_timestamp()}, headers=headers)
        
        if response.status_code == 200:
            response = response.json()
            categories = list(response.values())
            
            for category in categories:            
                product = {'type': category["optionType"], 'label': category["label"], 'subproducts': []}
                
                category_expirations = list(category["expirations"].values())
                productIds = category["productIds"]
                for productId in productIds:
                    subproduct = {'id': productId, 'expirations': []}

                    product_expirations = list(filter(lambda e : e["productId"] == productId, category_expirations))
                    for product_expiration in product_expirations:
                        label = product_expiration["label"]
                        code = product_expiration["expiration"]
                        date = get_cme_market_date(label, category["optionType"])
                        
                        if date is not None and date.date() > today.date():
                            subproduct["expirations"].append({'date': date, 'label': label, 'code': code})

                    subproduct["expirations"].sort(key=lambda d: d['date'])
                    product["subproducts"].append(subproduct)
                products.append(product)

    except Exception as e:
        print("Error on get_cme_market_products")
        print(e)

    return products


def get_cme_subproduct_volumes(subproduct):
    volumes = []
    try: 

        lastTradeDate = get_last_trading_date_format()
        params = {'tradeDate': lastTradeDate, '_': get_timestamp()}
        response = http_get(url=f'{base_url}/Volume/Details/O/{subproduct["id"]}/{lastTradeDate}/P', params=params, headers=headers)
        
        if response.status_code == 200:
            response = response.json()

            if "monthData" in response:
                volumes = response["monthData"]
                volumes.sort(key=lambda v: get_string_to_datetime(v["month"], format=f'%b %y {v["label"]}'))

    except Exception as e:
        print("Error on get_cme_subproduct_volumes")
        print(e)

    return volumes

def get_cme_market_chain(market, expiration, subproduct, subprod_expiration, subprod_volumes):

    chain = {
        "exchange": market["exchange"], 
        "symbol": market["symbol"],
        "expiration": expiration["symbol"],
        "date": subprod_expiration["date"], 
        "options": []
    }

    try:
        response = http_get(url=f'{base_url}/Quotes/Option/{subproduct["id"]}/G/{subprod_expiration["code"]}/ALL', params={'_': get_timestamp()}, headers=headers)

        if response.status_code == 200:
            response = response.json()

            if len(subprod_volumes) == 2:
                subprod_volumes.sort(key=lambda v: v["label"])
                callData = subprod_volumes[0]["strikeData"]
                putData = subprod_volumes[1]["strikeData"]
            else:
                callData = []
                putData = []
            

            underlying_price = get_underlying_price(market["underlying"])

            callDataIdx = 0
            putDataIdx = 0
            options_response = response["optionContractQuotes"]

            for option_response in options_response:
                strike_price = (get_round_price(option_response["strikePrice"], decimals=2) or 0) / 100
                option = {
                    "strike": strike_price,
                    "state": get_strike_state(strike_price, underlying_price)
                }

                put = {}
                call = {}
                for field in cme_fields:
                    if PUT in option_response and field["id"] in option_response["put"]:
                        value = option_response["put"][field["id"]]
                        put[field["name"]] = get_round_price(value)
                    else:
                        put[field["name"]] = None
                    
                    if CALL in option_response and field["id"] in option_response["call"]:
                        value = option_response["call"][field["id"]]
                        call[field["name"]] = get_round_price(value)
                    else:
                        call[field["name"]] = None
                
                if callDataIdx < len(callData) and option["strike"] == get_round_price(callData[callDataIdx]["strike"]):
                    call["openInterest"] = get_round_price(callData[callDataIdx]["atClose"])
                    callDataIdx += 1
                else:
                    call["openInterest"] = None

                if putDataIdx < len(putData) and option["strike"] == get_round_price(putData[putDataIdx]["strike"]):
                    put["openInterest"] = get_round_price(putData[putDataIdx]["atClose"])
                    putDataIdx +=1
                else:
                    put["openInterest"] = None

                put["type"] = PUT
                put["price"] = get_security_price(put)
                put["state"] = get_option_state(underlying_price, option["strike"], put["type"])
                put["contract"] = get_option_contract(chain, option["strike"], put["type"])

                call["type"] = CALL
                call["price"] = get_security_price(call)
                call["state"] = get_option_state(underlying_price, option["strike"], call["type"])
                call["contract"] = get_option_contract(chain, option["strike"], call["type"])

                option["put"] = put
                option["call"] = call                
                chain["options"].append(option)

    except Exception as e:
        print("Error on get_cme_market_chain")
        print(e)

    return chain

def get_cme_market_volumes(market):
    volumes = []
    try: 
        lastTradeDate = get_last_trading_date_format()
        params = {'tradeDate': lastTradeDate, '_': get_timestamp()}
        response = http_get(url=f'{base_url}/Volume/Details/F/{market["futuresId"]}/{lastTradeDate}/P', params=params, headers=headers)
        
        if response.status_code == 200:
            response = response.json()

            if "monthData" in response:
                volumes = response["monthData"]
                volumes.sort(key=lambda v: get_string_to_datetime(v["month"], format="%b %Y"))

    except Exception as e:
        print("Error on get_cme_market_volumes")
        print(e)

    return volumes

def get_cme_market_futures(market, volumes):
    futures = []
    try: 
        response = http_get(url=f'{base_url}/Quotes/Future/{market["futuresId"]}/G', params={'_': get_timestamp()}, headers=headers)

        if response.status_code == 200:
            response = response.json()
            futures_response = response["quotes"]
        else:
            futures_response = []
        
        volumeIdx = 0
        for future_response in futures_response:
            future = {"exchange": market["exchange"], "symbol": market["symbol"], "expiration": "EOM"}
            
            for field in cme_futures_fields:
                if field["id"] in future_response:
                    value = future_response[field["id"]]
                    future[field["name"]] = get_round_price(value)
                else:
                    future[field["name"]] = None

            month = get_string_to_datetime(future_response["expirationMonth"], format="%b %Y")

            if month:
                next_month = month.replace(day=28) + timedelta(days=4)
                future["date"] = next_month - timedelta(days=next_month.day)

                if volumeIdx < len(volumes) and volumes[volumeIdx]["month"] == get_datetime_to_string(future["date"], format="%b %y").upper():
                    future["openInterest"] = get_round_price(volumes[volumeIdx]["atClose"])

                future["type"] = FUTURE
                future["strike"] = 0
                future["price"] = get_security_price(future)
                future["contract"] = get_future_contract(future)
                futures.append(future)

            volumeIdx+=1

    except Exception as e:
        print("Error on get_cme_market_futures")
        print(e)

    return futures


@shared_task
def update_cme():
    outcome = "Completed without exceptions"
    
    try:
        print("Update CME started")
        market_collection = db.market
        chain_collection = db.chain
        future_collection = db.future

        today = get_truncated_datetime()

        markets = get_markets_by_exchange("CME")
        
        for market in markets:
            # For all markets of CME
            futures = []
            underlying = {}

            if market["futuresId"] is not None:
                volumes = get_cme_market_volumes(market)
                futures = get_cme_market_futures(market, volumes)
                
                for future in futures:
                    future_collection.replace_one(get_future_filter(future), future, upsert=True)

            if market["futuresId"] == market["id"]:
                underlying = get_future_underlying(futures)
        
            elif market["outsourceId"] == market["id"]:
                # Get underlying from yahoo
                underlying = get_yahoo_underlying(market)

            market["expirations"] = []
            market["underlying"] = underlying
        
            if market["chainsId"] is not None:
                products = get_cme_market_products(market)
                
                for product in products:
                    expiration = create_expiration(product["type"], product["label"], [])
                    subproducts = product["subproducts"]
                    tot = 0

                    for subproduct in subproducts:
                        subIdx = 0
                        subprod_volumes = get_cme_subproduct_volumes(subproduct)
                        subprod_expirations = subproduct["expirations"]
                        tot = min(min(len(subprod_expirations), MAX_EXPIRATIONS), int(len(subprod_volumes)/2))

                        for subprod_expiration in subprod_expirations[0:tot]:
                            # Save the chain
                            chain = get_cme_market_chain(market, expiration, subproduct, subprod_expiration, subprod_volumes[subIdx:subIdx+2])
                            chain["options"].sort(key=lambda o: o["strike"])
                            chain["index"] = get_underlying_strike_index(underlying, chain)
                            chain_collection.replace_one(get_chain_filter(chain), chain, upsert=True)
                            
                            # Update current expiration expirations and index
                            expiration["dates"].append(subprod_expiration["date"])
                            subIdx += 2
                    
                    if tot > 0:
                        market["expirations"].append(expiration)

            market_collection.replace_one(get_market_filter(market), market, upsert=True)

        print("Update CME completed")
    except Exception as e:
        print("Exception handled on update_cme")
        print(e)

        outcome = "Completed with exceptions"

    return outcome


# HISTORY

def get_cme_market_future(id, tradeDate, tradeMonth):
    future = {}
    try:
        response = http_get(url=f'{base_url}/Settlements/Futures/Settlements/{id}/FUT', params={'tradeDate': get_datetime_to_string(tradeDate, format="%m/%d/%Y")}, headers=headers)
        if response.status_code == 200:
            response = response.json()
            settlements = response["settlements"]
            
            for settlement in settlements:
                date = get_string_to_datetime(settlement["month"], format="%b %y")
                if date and date.month <= tradeMonth and date.month >= tradeMonth - 3:
                    future = settlement
                    break
    except Exception as e:
        print("Error on get_cme_market_future")
        print(e)
        future = {}

    return future

def get_cme_history(market=None):
    history = {"exchange": market["exchange"], "symbol": market["symbol"], "days": []}

    if market["id"] == market["futuresId"]:
        tradeMonth = get_trade_month()
        tradeDate = get_last_trade_day()
        endDate = tradeDate.replace(month=(tradeDate.month//3)*3, day=1, hour=0, minute=0, second=0)       
        openInterest = "-"
        
        while tradeDate >= endDate:
            future = get_cme_market_future(market["id"], tradeDate, tradeMonth)

            if future is not None:
                day = {"date": tradeDate, "openInterest": get_round_price(openInterest) if openInterest != "-" else None}

                for field in cme_day_fields:
                    if field["id"] in future:
                        value = sub(r'[,AB]+', '', future[field["id"]])
                        day[field["name"]] = get_round_price(value)
                    else:
                        day[field["name"]] = None

                day["price"] = get_security_price(day)

                if "openInterest" in future:
                    openInterest = future["openInterest"]
                else:
                    openInterest = "-"

                history["days"].append(day)

            tradeDate = get_last_trade_day(tradeDate)

        history["days"].sort(key=lambda d: d["date"])
    return history

@shared_task
def update_cme_history():
    outcome = "Completed without exceptions"

    try:
        print("Update CME history started")

        history_market_collection = db.history_market
        markets = get_markets_by_exchange("CME")

        for market in markets:
            history = get_cme_history(market)
            yhistory = get_yahoo_history(market, history)

            if yhistory is not None:
                history["days"] = list(yhistory.values())
                history["days"].sort(key=lambda d: d["date"])
            history_market_collection.replace_one({"exchange": history["exchange"], "symbol": history["symbol"]}, history, upsert=True)

        print("Update CME history completed")

    except Exception as e:
        print("Exception handled on update_cme_history")
        print(e)

        outcome = "Completed with exceptions"
    return outcome
