
def get_strategy_group_lookup():
    return {
        "from": "group",
        "let": {"groupId": "$groupId"},
        "pipeline": [
            {"$match": {"$expr": {"$eq":["$symbol", "$$groupId"]}}},
            {"$project": {
                "_id": 0,
            }}
        ],
        "as": "groups"
    }

def get_strategy_market_lookup(source="positions"):
    lookup = {
        "from": "market",
        "let": {"position": f"${source}"},
        "pipeline": [
            {"$match": {"$expr": {"$eq": ["$symbol", "$$position.symbol"]}}},
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
        "as": "markets"
    }
    return lookup

def get_strategy_chain_lookup(source="positions"):
    lookup = {
        "from": "chain",
        "let": {"position": f"${source}"},
        "pipeline": [
            {"$match": {
                "$expr": {
                    "$and": [
                        {"$eq": ["$symbol", "$$position.symbol"]},
                        {"$eq": ["$expiration", "$$position.expiration"]},
                        {"$eq": ["$date", "$$position.date"]}
                    ]
                }
            }},
            {"$unwind": "$options"},
            {"$match": { 
                "$expr": { 
                    "$or": [
                        {"$eq":["$options.put.contract","$$position.contract"]},
                        {"$eq": ["$options.call.contract", "$$position.contract"]}
                    ]
                }
            }},
            {"$project": {
                "strike": "$options.strike", 
                "option": {"$cond": [{"$eq": ["$options.call.contract", "$$position.contract"]}, "$options.call", "$options.put"]}}},
            {"$replaceRoot": {"newRoot": { "$mergeObjects": [{"strike": "$strike"}, "$option"] }}},
        ],
        "as": "options"
    }

    return lookup


def get_strategy_future_lookup(source="positions"):
    lookup = {
        "from": "future",
        "let": {"position": f"${source}"},
        "pipeline": [
            {"$match": { "$expr": {"$eq": [ "$contract", "$$position.contract"] } } },
        ],
        "as": "futures"
    }

    return lookup
