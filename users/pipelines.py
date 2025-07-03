
from .lookups import *

def get_aggregate_strategy_positions(strategy):
    return [
        {"$match": {"_id": strategy["_id"], 'userId': strategy["userId"]}},
        {"$unwind": "$positions"},
        {"$lookup": get_strategy_market_lookup()},
        {"$lookup": get_strategy_chain_lookup()},
        {"$lookup": get_strategy_future_lookup()},
        { "$replaceRoot": {
            "newRoot": {
                "$mergeObjects": [ "$positions", {"$arrayElemAt": [ "$markets", 0 ] }, {"$arrayElemAt": [ "$options", 0 ] }, {"$arrayElemAt": [ "$futures", 0 ] } ]
            }
        }},
        {"$sort": {"status": -1, "endDate": -1, "startDate": -1}}
    ]