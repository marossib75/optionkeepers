from bson.objectid import ObjectId
from tasks import TEMP
from utils.mongodb import db
from utils.time import *

# MARKET

def select_market(symbol):
    return db.market.find_one({'symbol': symbol})


def select_markets(groupId=None, search=None):
    filter = {}

    if groupId is not None and groupId != '':
        filter["groupId"] = groupId
    
    if search is not None and search != '':
        filter["$text"] = { '$search': search}
    
    return list(db.market.aggregate([
        {"$match": filter},
        {"$project": {
            "_id": "$$REMOVE",
            "groupId": 1,
            "exchange": 1,
            "symbol": 1,
            "label": 1,
            "country": 1,
            "currency": 1,
            "template": 1,
            "underlying": 1,
        }}
    ]))

# mobile
def select_markets_search(groupId=None, search=None, mrkt=None):
    filter = {}

    if groupId is not None and groupId != '':
        filter["groupId"] = groupId
    
    if search is not None and search != '':
        filter["$text"] = { '$search': search}

    if mrkt is not None and mrkt != '':
        filter["template"] = mrkt
    
    return list(db.market.aggregate([
        {"$match": filter},
        {"$project": {
            "_id": "$$REMOVE",
            "groupId": 1,
            "exchange": 1,
            "symbol": 1,
            "label": 1,
            "country": 1,
            "currency": 1,
            "template": 1,
            "underlying": 1,
        }}
    ]))

# mobile
def select_markets_paginated(groupId=None, search=None, mrkt=None, skip =None, limit=None):
    filter = {}

    if groupId is not None and groupId != '':
        filter["groupId"] = groupId
    
    if search is not None and search != '':
        filter["$text"] = { '$search': search}

    if mrkt is not None and mrkt != '':
        filter["template"] = mrkt
    
    return list(db.market.aggregate([
        {"$match": filter},
        { "$sort" : { "label" : 1 } },
        { "$skip" : skip },
        { "$limit" : limit },
        {"$project": {
            "_id": "$$REMOVE",
            "groupId": 1,
            "exchange": 1,
            "symbol": 1,
            "label": 1,
            "country": 1,
            "currency": 1,
            "template": 1,
            "underlying": 1,
        }}
    ]))

# mobile
def count_market_elements(mrkt=None):
    filter = {}

    if mrkt is not None and mrkt != '':
        filter["template"] = mrkt


    return (db.market.aggregate([
        {"$match": filter},
        {"$count": "count"}
    ]))

# HISTORY

def select_history_market(symbol):
    return db.history_market.find_one({'symbol': symbol})


# FUTURES

def select_future(symbol, expiration, date):
    filter = { "symbol": symbol }

    if expiration and date:
        filter["expiration"] = expiration

        if isinstance(date, str):
            filter["date"] = get_string_to_datetime(date)

    futures = list(db.future.aggregate([
        {"$match": filter},
        {"$limit": 1},
        {"$project": {
            "_id": 0,
        }},
    ]))

    return futures[0] if len(futures) > 0 else None

def select_future_by_contract(contract):
    return db.future.find_one({'contract': contract})

def select_futures(symbol, userId, strategyId):
    return list(db.future.aggregate([
        {"$match": {"symbol": symbol, "expiration": "EOM"}},
        {"$lookup": {
            "from": "strategy",
            "let": {"contract": "$contract"},
            "pipeline": [
                {"$match": {"_id": ObjectId(strategyId), "userId": userId}},
                {"$unwind": "$positions"},
                {"$match": {"$expr": {"$and": [
                    {"$eq": ["$positions.status", TEMP]},
                    {"$eq": ["$positions.contract", "$$contract"]},
                ]}}},
                {"$replaceRoot": {"newRoot": {"$cond": [
                    "$whatif.enabled",
                    {"$mergeObjects": ["$positions", "$positions.whatif"]},
                    "$positions"
                ]}}},
                {"$project": {
                    "quantity": 1,
                    "active": 1,
                }}
            ],
            "as": "positions",
        }},
        {"$replaceRoot": {
            "newRoot": { 
                "$mergeObjects": ["$$ROOT", {"$arrayElemAt": ["$positions", 0]}],
            }
        }}
    ]))