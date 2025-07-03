from .base import *

base_url = 'https://cdn.cboe.com/api/global/delayed_quotes'

cboe_fields = [
    {'name': 'last', 'id': 'last_trade_price'},
    {'name': 'open', 'id': 'open'},
    {'name': 'close', 'id': 'prev_day_close'},
    {'name': 'settle', 'id': None},
    {'name': 'ask', 'id': 'ask'},
    {'name': 'askVol', 'id': 'ask_size'},
    {'name': 'bid', 'id': 'bid'},
    {'name': 'bidVol', 'id': 'bid_size'},
    {'name': 'volume', 'id': 'volume'},
    {'name': 'openInterest', 'id': 'open_interest'},
    {'name': 'low', 'id': 'low'},
    {'name': 'high', 'id': 'high'},
    {'name': 'volatility', 'id': 'iv'},
]

cboe_underlying_fields = [
    {'name': 'last', 'id': 'current_price'},
    {'name': 'open', 'id': 'open'},
    {'name': 'close', 'id': 'prev_day_close'},
    {'name': 'settle', 'id': None},
    {'name': 'low', 'id': 'low'},
    {'name': 'high', 'id': 'high'},
    {'name': 'volume', 'id': 'volume'},
    {'name': 'openInterest', 'id': None}
]

cboe_day_fields = [
    {'name': 'last', 'id': None},
    {'name': 'open', 'id': 'open'},
    {'name': 'close', 'id': 'close'},
    {'name': 'settle', 'id': None},
    {'name': 'low', 'id': 'low'},
    {'name': 'high', 'id': 'high'},
    {'name': 'volume', 'id': 'volume'},
    {'name': 'openInterest', 'id': None}
]

expirations_dict = {
    'EOM': 'End of month',
    'W': 'Weekly',
}

def get_cboe_market_option(id, symbol_len):
    idx = len(id)
    strike_price = (get_round_price(id[idx-8:idx], decimals=2) or 0) / 1000
    idx -= 8

    option_type = id[idx-1:idx]
    idx -= 1

    exp_date = get_string_to_datetime(id[idx-6:idx], format="%y%m%d")
    idx -= 6
    
    exp_label = f'{exp_date.year} {exp_date.month} {exp_date.day}'
    exp_symbol = "EOM"

    if idx > symbol_len:
        exp_symbol = id[symbol_len:idx]
        exp_label = f'{exp_symbol} {exp_label}'

    return exp_symbol, exp_label, exp_date, option_type, strike_price

def get_cboe_market_underlying(data):
    underlying =  {}

    for field in cboe_underlying_fields:
            if field["id"] in data and data[field["id"]] is not None:
                underlying[field["name"]] = get_round_price(data[field["id"]])
            else:
                underlying[field["name"]] = None

    underlying["price"] = get_underlying_price(underlying)
    return underlying

def get_cboe_market_chain(market):
    chains = {}
    expirations = {}
    underlying =  {}

    response = http_get(url=f'{base_url}/options/{market["id"]}.json')

    if response.status_code == 200:
        response = response.json()
        data = response["data"] if "data" in response else {}
        underlying = get_cboe_market_underlying(data)
        
        options = []
        if "options" in data:
            options = data["options"] or []

        chain_option = None
        today = get_truncated_datetime()

        for option in options:

            # Load info from CBOE contract
            exp_symbol, exp_label, exp_date, option_type, strike_price = get_cboe_market_option(option["option"], len(market["symbol"]))            
            
            if exp_date.date() > today.date():
                
                # Check if chain already exist in the dictionary of all chains
                if exp_label not in chains:

                    # If not create new chain and add to the dictionary
                    chains[exp_label] = {
                        'exchange': market["exchange"],
                        'symbol': market["symbol"],
                        'expiration': exp_symbol,
                        'date': exp_date,
                        'options': []
                    }

                    # Check if expiration symbol already exist in the dictionary of all expirations
                    if exp_symbol not in expirations:

                        # If not create new expiration and add to the dictionary
                        expirations[exp_symbol] = {
                            'symbol': exp_symbol,
                            'label': expirations_dict[exp_symbol] if exp_symbol in expirations_dict else exp_symbol,
                            'dates': []
                        }
                    # Add date to the related expiration symbol
                    expirations[exp_symbol]["dates"].append(exp_date)

                # Get chain from the dictionary
                chain = chains[exp_label]

                if chain_option is None:
                    chain_option = {
                        "strike": strike_price,
                        "state": get_strike_state(strike_price, underlying["price"])
                    }
                    
                if strike_price == chain_option["strike"]:
                    option_values = {}
                    
                    for field in cboe_fields:
                        if field["id"] in option and option[field["id"]] is not None:
                            option_values[field["name"]] = get_round_price(option[field["id"]])
                        else:
                            option_values[field["name"]] = None
                    
                    if option_type == 'P':
                        option_values["type"] = PUT
                        chain_option["put"] = option_values
                    
                    if option_type == 'C':
                        option_values["type"] = CALL
                        chain_option["call"] = option_values

                    option_values["price"] = get_security_price(option_values)
                    option_values["state"] = get_option_state(underlying["price"], chain_option["strike"], option_values["type"])
                    option_values["contract"] = get_option_contract(chain, chain_option["strike"], option_values["type"])

                    if CALL in chain_option and PUT in chain_option: 
                        chain["options"].append(chain_option)
                        chain_option = None

                else:
                    raise Exception("CBOE Exception: strike prices not aligned")

    return underlying, list(expirations.values()), list(chains.values())


@shared_task
def update_cboe():
    response = "Completed without exceptions"

    try:
        print("Update CBOE started")

        market_collection = db.market
        chain_collection = db.chain

        markets = get_markets_by_exchange("CBOE")
        for market in markets:
            underlying, expirations, chains = get_cboe_market_chain(market)

            for chain in chains:
                chain["options"].sort(key=lambda o: o["strike"])
                chain["index"] = get_underlying_strike_index(underlying, chain)
                chain_collection.replace_one(get_chain_filter(chain), chain, upsert=True)

            market["underlying"] = underlying
            market["expirations"] = expirations
            market_collection.replace_one(get_market_filter(market), market, upsert=True)

        print("Update CBOE completed")
    except Exception as e:
        print("Exception handled on update_cboe")
        print(e)
        response = "Completed with exceptions"
    
    return response


# HISTORY

def get_cboe_history(market=None):
    days = []
    try: 
        response = http_get(url=f'{base_url}/charts/historical/{market["id"]}.json')
        if response.status_code == 200:
            response = response.json()
            if "data" in response:
                days = response["data"]

        if len(days) > 0:
            days = days[-365:] if len(days) > 365 else days

            for day in days:
                if "date" in day:
                    day["date"] = get_string_to_datetime(day["date"])

                    for field in cboe_day_fields:
                        if field["id"] is not None and field["id"] in day:
                            day[field["name"]] = get_round_price(day[field["id"]])
                        else:
                            day[field["name"]] = None

                    day["price"] = get_security_price(day)

            days.sort(key=lambda d: d["date"])

    except Exception as e:
        print("Error on get_cboe_history")
        print(e)

    return {"exchange": market["exchange"], "symbol": market["symbol"], "days": days}

@shared_task
def update_cboe_history():
    outcome = "Completed without exceptions"
    try:
        print("Update CBOE history started")

        history_market_collection = db.history_market
        markets = get_markets_by_exchange("CBOE")
    
        for market in markets:
            history = get_cboe_history(market)
            history_market_collection.replace_one({"exchange": history["exchange"], "symbol": history["symbol"]}, history, upsert=True)

        print("Update CBOE history completed")

    except Exception as e:
        print("Exception handled on update_cboe_history")
        print(e)

        outcome = "Completed with exceptions"
    return outcome