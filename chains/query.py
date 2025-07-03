from utils.mongodb import db
from utils.time import *

from .pipelines import *

def select_chain(symbol, expiration, date):
    filter = { "symbol": symbol }

    if expiration and date:
        filter["expiration"] = expiration

        if isinstance(date, str):
            filter["date"] = get_string_to_datetime(date)

    chains = list(db.chain.aggregate([
        {"$match": filter},
        {"$limit": 1},
        {"$project": {
            "_id": "$$REMOVE",
            "exchange": 1,
            "symbol": 1,
            "expiration": 1,
            "date": 1,
            "index": 1,
            "options": 1,
        }},
    ]))

    return chains[0] if len(chains) > 0 else None

def select_history_chain(symbol, expiration, date, prev=-2):
    history = list(db.history_chain.aggregate(get_history_chain(symbol, expiration, get_string_to_datetime(date), prev)))
    return history[0] if len(history) == 1 else None

def select_chain_options(symbol, expiration, date, userId=None, strategyId=None):
    filter = { "symbol": symbol }

    if expiration is not None and date is not None:
        filter["expiration"] = expiration

        if isinstance(date, str):
            filter["date"] = get_string_to_datetime(date)
    else:
        filter["expiration"] = "EOM"
        filter["date"] = {"$gt": get_truncated_datetime()}

    chains = list(db.chain.aggregate(get_chain_options_with_quantity(userId, strategyId, filter)))

    return chains[0] if len(chains) > 0 else None

def select_chain_option_by_contract(contract):
    options = []
    
    if contract is not None:
        values = contract.split('-')

        if len(values) == 6:
            exchange = values[0]
            symbol = values[1]
            expiration = values[2]
            date = get_string_to_datetime(values[3], format="%Y%m%d")

        options = list(db.chain.aggregate(get_chain_option_by_contract(exchange, symbol, expiration, date, contract)))

    return options[0] if len(options) > 0 else None

def select_chain_options_by_expiration_per_strike(symbol, expiration, limit):
    return list(db.chain.aggregate(get_chain_options_by_expiration_per_strike(symbol, expiration, get_truncated_datetime(), limit)))
    
def select_aggregated_oi_per_strike(symbol, expiration, date):
    return list(db.history_chain.aggregate(get_aggregated_oi_per_strike(symbol, expiration, get_string_to_datetime(date))))

def select_aggregated_oi_per_expiration(symbol, expiration):
    return list(db.history_chain.aggregate(get_aggregated_oi_per_expiration(symbol, expiration, get_truncated_datetime())))