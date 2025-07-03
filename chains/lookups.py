from bson.objectid import ObjectId

from tasks import TEMP

def get_chain_market_lookup():
    return {
        "from": "market",
        "let": {"symbol": "$symbol"},
        "pipeline": [
            {"$match": {"$expr": {"$eq": ["$symbol", "$$symbol"]}}},
            {"$addFields": {
                "riskFree": {"$cond": [{"$eq": ["$currency", "USD"]}, 0.5, 0]},
                "underlyingPrice": "$underlying.price"
            }},
            {"$project": {
                "_id": 0,
                "id":0,
                "outsourceId": 0,
                "expirations": 0,
                "underlying": 0,
            }},
        ],
        "as": "markets",
    }

def get_chain_underlying_lookup():
    return {
        "from": "market",
        "let": {"symbol": "$symbol"},
        "pipeline": [
            {"$match": {"$expr": {"$eq": ["$symbol", "$$symbol"]}}},
            {"$replaceRoot": {"newRoot": "$underlying"}},
        ],
        "as": "underlyings",
    }


def get_chain_strategy_lookup(userId, strategyId, option_type):
    return {
        "from": "strategy",
        "let": {"contract": f"$options.{option_type}.contract"},
        "pipeline": [
            {"$match": {"_id": ObjectId(strategyId), "userId": userId}},
            {"$unwind": "$positions"},
            {"$match": {"$expr": {"$and": [
                {"$eq": ["$positions.status", TEMP]},
                {"$eq": ["$positions.contract", "$$contract"]}
            ]}}},
            {"$replaceRoot": {"newRoot": {"$cond": [
                "$whatif.enabled",
                {"$mergeObjects": ["$positions", "$positions.whatif"]},
                "$positions"
            ]}}},
            {"$project": {
                "contract": 1,
                "quantity": 1,
                "active": 1,
            }}
        ],
        "as": f"{option_type}Positions",
    }