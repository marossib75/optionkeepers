from .lookups import *

def get_chain_option_by_contract(exchange, symbol, expiration, date, contract):
    return [
        {"$match": {
            "exchange": exchange,
            "symbol": symbol,
            "expiration": expiration,
            "date": date,
        }},
        {"$unwind": "$options"},
        {"$match": {"$or": [{"options.put.contract": contract},{"options.call.contract": contract}]}},
        {"$project": {
            "chain": {
                "exchange": "$exchange",
                "symbol": "$symbol",
                "expiration": "$expiration",
                "date": "$date",
                "strike": "$options.strike",
            },
            "option": {"$cond": [{"$eq": ["$options.call.contract", contract]}, "$options.call", "$options.put"]}
        }},
        {"$replaceRoot": {"newRoot": { "$mergeObjects": ["$chain", "$option"] }}},
    ]

def get_chain_options_with_quantity(userId, strategyId, filter):
    return [
        {"$match": filter},
        {"$limit": 1},
        {"$unwind": "$options"},
        {"$lookup": get_chain_strategy_lookup(userId, strategyId, "put")},
        {"$lookup": get_chain_strategy_lookup(userId, strategyId, "call")},
        {"$lookup": get_chain_underlying_lookup()},
        {"$project": {
            "exchange": 1,
            "symbol": 1,
            "expiration": 1,
            "date": 1,
            "index": 1,
            "options": 1,
            "underlying": {"$arrayElemAt": ["$underlyings", 0]},
            "putPosition": {"$arrayElemAt": ["$putPositions", 0]},
            "callPosition": {"$arrayElemAt": ["$callPositions", 0]}
        }},
        {"$replaceRoot": {
            "newRoot": { 
                "$mergeObjects": [
                    "$$ROOT",
                    {"options": {
                        "strike": "$options.strike",
                        "call": {"$cond": [{"$eq": ["$callPosition.contract", "$options.call.contract"]}, {"$mergeObjects": ["$callPosition", "$options.call"]}, "$options.call"]},
                        "put": {"$cond": [{"$eq": ["$putPosition.contract", "$options.put.contract"]}, {"$mergeObjects": ["$putPosition", "$options.put"]}, "$options.put"]}
                    }},
                ],
            }
        }},
        {"$sort": {"options.strike": 1}},
        {"$group": {
            "_id": {
                "id": "$_id",
                "index": "$index",
                "exchange": "$exchange",
                "symbol": "$symbol",
                "expiration": "$expiration",
                "date": "$date",
                "underlying": "$underlying"
            },
            "options": {"$push": "$options"}
        }},
        {"$project": {
            "_id": "$$REMOVE",
            "index": "$_id.index",
            "exchange": "$_id.exchange",
            "symbol": "$_id.symbol",
            "expiration": "$_id.expiration",
            "date": "$_id.date",
            "underlying": "$_id.underlying",
            "options": 1,
        }}
    ]

def get_history_chain(symbol, expiration, date, prev=-2):
    return [
        {"$match": {"symbol": symbol, "expiration": expiration, "date": date}},
        {"$project": {
            "symbol": 1,
            "date": 1,
            "expiration": 1,
            "days": {"$slice": ["$days", prev]},
        }},
        {"$lookup": get_chain_market_lookup()},
        {"$unwind": "$days"},
        {"$unwind": "$days.options"},
        {"$project": {
            "day": "$days.date",
            "index": "$days.index",
            "info": {
                "expiration": "$expiration",
                "symbol": "$symbol",
                "date": "$date",
            },
            "options": "$days.options",
            "market": {"$arrayElemAt": [ "$markets", 0 ]}
        }},
        {"$project": {
            "day": "$day",
            "index": "$index",
            "info": "$info",
            "strike": "$options.strike",
            "call":  {"$mergeObjects": ["$options.call", "$info", "$market", {"strike": "$options.strike"}]},
            "put":  {"$mergeObjects":  ["$options.put", "$info", "$market", {"strike": "$options.strike"}]}
        }},
        {"$sort": {"day": 1, "strike": 1}},
        {"$group": {
            "_id": {"day": "$day", "info": "$info", "index": "$index"},
            "options": {"$push": {"strike": "$strike", "call": "$call", "put": "$put"}},
        }},
        {"$sort": {"_id.day": 1}},
        {"$group": {
            "_id": "$_id.info",
            "days": {"$push":{"date": "$_id.day", "options": "$options", "index": "$_id.index"}},
        }},
        {"$project": {
            "symbol": "$_id.symbol",
            "date": "$_id.date",
            "expiration": "$_id.expiration",
            "first": {"$arrayElemAt": ["$days", 0]},
            "last": {"$arrayElemAt": ["$days", -1]},
        }}
    ]

def get_chain_options_by_expiration_per_strike(symbol, expiration, startDate, limit):
    return [
        {"$match": {"symbol": symbol, "expiration": expiration, "date": {"$gte": startDate}, "options": {"$not": {"$size": 0}}}},
        {"$limit": limit},
        {"$lookup": get_chain_market_lookup()},
        {"$unwind": "$options"},
        {"$project": {
            "date": "$date",
            "strike": "$options.strike",
            "call":  {"$mergeObjects": ["$options.call", {"$arrayElemAt": [ "$markets", 0 ]}, {"strike": "$options.strike", "date": "$date"}]},
            "put":  {"$mergeObjects":  ["$options.put", {"$arrayElemAt": [ "$markets", 0 ]}, {"strike": "$options.strike", "date": "$date"}]}
        }},
        {"$sort": {"strike": 1, "date": 1}},
        {"$group": {
            "_id": "$strike",
            "options": {"$push":{"date": "$date", "call": "$call", "put": "$put"}},
        }},
        {"$project": {
            "strike": "$_id",
            "options": "$options",
        }},
        {"$sort": {"strike": 1}},
    ]


def get_aggregated_oi_per_strike(symbol, expiration, date):
    return [
        {"$match": {
            "symbol": symbol,
            "expiration": expiration,
            "date": date,
        }},
        {"$project": {
            "date": 1,
            "expiration": 1,
            "days": {"$slice": ["$days", -2]},
        }},
        {"$unwind": "$days"},
        {"$project": { 
            "date": "$days.date",
            "options": {
              "$map": {
                    "input": "$days.options",
                    "as": "option",
                    "in": { "strike":"$$option.strike", "oiPut": "$$option.put.openInterest", "oiCall": "$$option.call.openInterest"}
                }
            }
         }
        },
        {"$sort": {"date": -1}},
        {"$unwind": "$options"},
        {"$group": {
            "_id": "$options.strike",
            "lastDoc": {"$last": "$$ROOT"},
            "firstDoc": {"$first": "$$ROOT"}
        }},
        {"$sort": {"_id": 1}},
        {"$group": {
            "_id": {"start": "$lastDoc.date", "end": "$firstDoc.date"},
            "values": { 
              "$push": {
                "strike": "$_id", 
                "oiPut": "$firstDoc.options.oiPut", 
                "oiCall": "$firstDoc.options.oiCall", 
                "oiDiffPut": {"$subtract": ["$firstDoc.options.oiPut", "$lastDoc.options.oiPut"]},
                "oiDiffCall": {"$subtract": ["$firstDoc.options.oiCall", "$lastDoc.options.oiCall"]}
              }},
        }},
        {"$limit":1},
        { "$project": {
            "_id": "$$REMOVE",
            "start": "$_id.start",
            "end": "$_id.end",
            "values": 1
        }},
    ]

def get_aggregated_oi_per_expiration(symbol, expiration, startDate):
    return [
        {"$match": {
            "symbol": symbol,
            "expiration": expiration,
            "date": {"$gte": startDate}
        }},
        {"$project": {
            "date": 1,
            "expiration": 1,
            "days": {"$slice": ["$days", -2]},
        }},
        {"$unwind": "$days"}, 
        {"$unwind": "$days.options"},
        {"$group": {
            "_id": {"date":"$date", "day": "$days.date"},
            "totPut": {"$sum": "$days.options.put.openInterest"},
            "totCall": {"$sum": "$days.options.call.openInterest"}
        }},
        {"$sort": {"_id.date": 1, "_id.day": -1}},
        {"$group": {
            "_id": "$_id.date",
            "lastDoc": {"$last": "$$ROOT"},
            "firstDoc": {"$first": "$$ROOT"}
        }},
        {"$sort": {"_id": 1}},
        {"$group": {
            "_id": {
                "start": "$lastDoc._id.day",
                "end": "$firstDoc._id.day"
            },
            "values": {
                "$push": {
                    "date": "$_id",
                    "diffPut": {"$subtract": ["$firstDoc.totPut", "$lastDoc.totPut"]},
                    "diffCall": {"$subtract": ["$firstDoc.totCall", "$lastDoc.totCall"]},
                    "totPut": "$firstDoc.totPut",
                    "totCall": "$firstDoc.totCall"
            }},
        }},
        {"$sort": {"_id.start": -1}},
        {"$limit": 1},
        { "$project": {
            "_id": "$$REMOVE",
            "start": "$_id.start",
            "end": "$_id.end",
            "values": 1
        }},
    ]