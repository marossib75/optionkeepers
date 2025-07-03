from celery import shared_task
from re import sub
from lxml.html import fromstring
from yahoofinancials import YahooFinancials

from utils.mongodb import db
from utils.time import *
from utils.search import *

from .http import *

PUT = "put"
CALL = "call"
FUTURE = "future"

TEMP = "temporary"
OPEN = "open"
CLOSE = "close"

ADD = "add"
UPDATE = "update"
DELETE = "delete"

# Per each option strike
NTM = "ntm" # Near the money
FTM = "ftm" # Far the money

# Per each option type (call, put)
ITM = "itm" # In the money 
OTM = "otm" # Out the money

MAX_EXPIRATIONS = 4

underlying_fields = [
    { "name": "last", "id": "last" },
    { "name": "open", "id": "open" },
    { "name": "close", "id": "close" },
    { "name": "settle", "id": "settle" },
    { "name": "low", "id": "low" },
    { "name": "high", "id": "high" },
    { "name": "volume", "id": "volume"},
    { "name": "openInterest", "id": "openInterest"},
]

def isTradingDay():
    return get_now().weekday < 6

def get_future_underlying(futures):
    underlying = {}
    future = {}
    tradeMonth = get_trade_month()

    for future in futures:
        futureMonth = future["date"].month
        if  futureMonth <= tradeMonth and futureMonth >= tradeMonth-3:
            underlying = future
            break

    for field in underlying_fields:
        if field["id"] in future:
            underlying[field["name"]] = future[field["id"]]
        else:
            underlying[field["name"]] = None

    underlying["price"] = get_underlying_price(underlying)

    return underlying

def get_chain_filter(chain):
    return {
        "exchange": chain["exchange"],
        "symbol": chain["symbol"],
        "expiration": chain["expiration"],
        "date": chain["date"]
    }

def get_future_filter(future):
    return {
        "exchange": future["exchange"],
        "symbol": future["symbol"],
        "expiration": future["expiration"],
        "date": future["date"]
    }

def get_underlying_strike_index(underlying, chain):
    # Search index of the underlying price
    index = None
    
    if "options" in chain:
        price = get_underlying_price(underlying)
    
        if chain["options"] is not None \
         and len(chain["options"]) > 0 \
         and price:
            index = binary_search(chain["options"], price, key="strike")

    return index

def get_security_price(security):
    price = None
    
    if security is not None:

        if "price" in security:
            price = security["price"]

        if (price is None or price == 0) and "last" in security:
            price = security["last"]

        if (price is None or price == 0) and "close" in security:
            price = security["close"]

        if (price is None or price == 0) and "settle" in security:
            price = security["settle"]

    return price

def get_underlying_price(underlying):
    return get_security_price(underlying)

def get_strike_state(strike, underlying_price):
    # Check if the option is near the money or out of the money
    return NTM if abs(strike-underlying_price) <= 5 else FTM

def get_round_price(value, decimals:int=2):
    price = None

    if value is not None:
        value = str(value).replace(',', '')

        if value.replace('.', '', 1).isdigit():
            price = round(float(value), ndigits=decimals)
        
    return price

def get_market_filter(market):
    return {"exchange": market["exchange"], "symbol": market["symbol"]}

def get_markets_by_exchange(exchange):
    markets = db.market.find({"exchange": exchange})
    return [market for market in markets if market["exchange"] == exchange]

def create_expiration(symbol, label, dates=[]):
    return {"symbol": symbol, "label": label, "dates": dates}

def generate_chain_contract(chain):
    contract = None
    if chain is not None:
        contract = f'{chain["exchange"]}-{chain["symbol"]}-{chain["expiration"]}-{get_datetime_to_string(chain["date"], format="%Y%m%d")}'
        contract = contract.upper()
    return contract

def get_option_contract(chain, strike, type):
    contract = generate_chain_contract(chain)
    if chain is not None:
        contract = f'{contract}-{type}-{int(strike*1000):010}'
        contract = contract.upper()
    return contract


def generate_future_contract(future):
    contract = None
    if future is not None:
        contract = f'{future["exchange"]}-{future["symbol"]}-{future["expiration"]}-{get_datetime_to_string(future["date"], format="%Y%m%d")}'
        contract = contract.upper()
    return contract

def get_future_contract(future):
    contract = generate_future_contract(future)
    
    if future is not None:
        contract = f'{contract}-{future["type"]}-{future["strike"]}'
        contract = contract.upper()

    return contract

def get_option_state(price, strike, type):
    state = None

    if type == PUT:
        if price < strike:
            state = ITM
        else:
            state = OTM

    elif type == CALL:
        if price > strike:
            state = ITM
        else:
            state = OTM

    return state