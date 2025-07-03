from .base import *

day_fields = [
    {'name': 'state', 'id': 'state'}, 
    {'name': 'type', 'id': 'type'},
    {'name': 'contract', 'id': 'contract'},
    {'name': 'last', 'id': 'last'},
    {'name': 'open', 'id': 'open'},
    {'name': 'close', 'id': 'close'},
    {'name': 'settle', 'id': 'settle'},
    {'name': 'price', 'id': 'price'},
    {'name': 'low', 'id': 'low'},
    {'name': 'high', 'id': 'high'},
    {'name': 'volume', 'id': 'volume'},
    {'name': 'openInterest', 'id': 'openInterest'},
]

def map_day_fields(values):
    value = {}

    for field in day_fields:

        if field["id"] is not None and field["id"] in values:
            value[field["name"]] = values[field["id"]]
        else:
            value[field["name"]] = None

    return value

def update_chain_history(filter, date):
    chains = db.chain.find(filter)
    chain_history = db.history_chain

    for chain in chains:
        options = list(map(
            lambda option : {
                "strike": option["strike"], 
                "call": map_day_fields(option["call"]),  
                "put": map_day_fields(option["put"])
            }, chain["options"]))

        day = {"date": date, "options": options, "index": chain["index"]}
        chain_history.update_one(get_chain_filter(chain), {'$pull': {'days': {'date': day["date"]}}})
        chain_history.update_one(get_chain_filter(chain), {'$addToSet': {'days': day}}, upsert=True)

    chain_history.update_many({"$where": "this.days.length > 30" }, {"$pop": {"days": -1}})


def update_market_history(filter, date):
    markets = db.market.find(filter)
    market_history = db.history_market

    for market in markets:
        day = map_day_fields(market["underlying"])
        day["date"] = date
        market_history.update_one(get_market_filter(market), {'$pull': {'days': {'date': day["date"]}}})
        market_history.update_one(get_market_filter(market), {'$addToSet': {'days': day}}, upsert=True)

    market_history.update_many({"$where": "this.days.length > 700" }, {"$pop": {"days": -1}})

@shared_task
def update_history(exchange=None):
    response = "Completed without exceptions"

    try:
        print("Update history started")

        filter = {} if exchange is None else {'exchange': exchange}
        date = get_truncated_datetime()

        update_chain_history(filter, date)
        update_market_history(filter, date)

        # Check for expired positions
        # db.strategy.update_many(
        #     {"positions": {"$elemMatch": {"positions.date": {"$lt": date}, "positions.status": OPEN}}},
        #     {"$set": {"positions.$.status": CLOSE, "positions.$.endDate": date, "positions.$.endPrice": None}},
        # )

        print("Update history completed")

    except Exception:
        print("Exception handled on update_history")
        response = "Completed with exceptions"
    
    return response