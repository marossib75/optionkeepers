from bson.objectid import ObjectId
from formulas.base import get_security_underlying_price

from tasks import *
from formulas import get_implied_volatility, get_time_value

from chains.query import select_chain_option_by_contract
from markets.query import select_future_by_contract, select_market

from utils.mongodb import db
from utils.time import *

from .pipelines import *

PAGINATION_SIZE_STRATEGIES = 10 #elements per page for strategies
PAGINATION_SIZE_CLUBS = 16

#USER

def select_users(search):
    return list(db.auth_user.aggregate([
        {"$match": {"username": {"$regex": '^'+search, "$options": 'im'}}},
        {"$project": {"_id":"$_id", "username": "$username", "email": "$email"}}
    ]))

def select_users_to_share_strategy(strategyId):
    return list(db.portfolio.aggregate([
        {"$match": {'other_strategies.shared': {'$nin': [{'_id': strategyId}]}}},
        {"$project": {"_id": 0 , "userId": "$userId"}}
    ]))


# PORTFOLIO

def insert_portfolio(userId, name="My Portfolio", value=100000, currency="EUR"):
    return db.portfolio.insert_one(
    {
        'userId': userId,
        'name': name,
        'value': value,
        'currency': currency,
        'created': get_now(),
        'strategies': [],
        'clubs': [],
        'other_strategies' : {
            'saved': [],
            'opened': [],
            'shared': [],
        }
    })


def select_portfolio(userId):
    portfolios = list(db.portfolio.aggregate([
        {"$match": {"userId": userId}},
        {"$lookup": {
            "from": "strategy",
            "let": {"strategies": "$strategies"},
            "pipeline": [
                {"$match": {"$expr": {"$in":["$_id", "$$strategies"]}}},
                {"$lookup": get_strategy_group_lookup()},
                {"$unwind": {
                    "path": "$positions",
                    "preserveNullAndEmptyArrays": True
                }},
                {"$lookup": get_strategy_market_lookup()},
                {"$lookup": get_strategy_chain_lookup()},
                {"$lookup": get_strategy_future_lookup()},
                {"$sort": {"status": -1, "endDate": -1, "startDate": -1}},
                {"$group": {
                    "_id": {
                        "id": "$_id",
                        "name": "$name",
                        "disabled": "$disabled",
                        "created": "$created",
                        "published": "$published",
                        "upvotes": "$upvotes",
                        "bookmarks": "$bookmarks",
                        "group": {"$arrayElemAt": ["$groups", 0]},
                    },
                    "positions": {"$push": {"$cond": [
                        {"$or": [{"$eq": ["$positions.status", TEMP]}, {"$eq": ["$positions.status", OPEN]}, {"$eq": ["$positions.status", CLOSE]}]},
                        {"$mergeObjects": [ "$positions", {"$arrayElemAt": ["$markets", 0]}, {"$arrayElemAt": ["$options",0]}, {"$arrayElemAt": ["$futures", 0]}]},
                        "$$REMOVE",
                    ]}}
                }},
                {"$project": {
                    "_id": "$_id.id",
                    "name": "$_id.name",
                    "disabled": "$_id.disabled",
                    "created": "$_id.created",
                    "group": "$_id.group",
                    "positions": 1,
                    "published": "$_id.published",
                    "upvotes": "$_id.upvotes",
                    "bookmarks": "$_id.bookmarks",
                    "total": {"$cond": { "if": { "$isArray": "$positions" }, "then": { "$size": "$positions" }, "else": 0} },
                }},
                {"$sort": {"name": 1, "created": -1, "total": 1}}
            ],
            "as": "strategies",
        }}
    ]))
    return portfolios[0] if len(portfolios) == 1 else None

def save_portfolio_strategy(userId, strategyId):
    return db.portfolio.update_one({
        "userId": userId
    }, {
        "$addToSet": {"strategies": strategyId}
    })

def delete_portfolio_strategy(userId, strategyId):
    return db.portfolio.update_one({
        "userId": userId
    }, {
        "$pull": {"strategies": strategyId}
    })

def delete_portfolio_other_strategy(strategyId, type, userId):
    pull = {}
    pull["other_strategies."+type] = {"strategyId": ObjectId(strategyId)} if type=='shared' else ObjectId(strategyId)

    return db.portfolio.update_one({
        "userId": userId
    }, {
        "$pull": pull
    })

def delete_portfolio_other_strategies(strategyId):
    return db.portfolio.update_many({},{
        "$pull": {
            "other_strategies.saved" : ObjectId(strategyId), 
            "other_strategies.opened" : ObjectId(strategyId),
            "other_strategies.shared" : {"strategyId": ObjectId(strategyId)}
        },
    })
    

# STRATEGIES

def sort_get_paginated_results(sortField, sortOrder):
    # for consistency always order by id as last
    sort = {}
    if sortField is not None:
        if sortField in ['upvotes', 'bookmarks', 'positions', 'clubs']:
            #use the new field with the lenght of the array
            sort["n"+sortField] = int(sortOrder)
        else:
            sort[sortField] = int(sortOrder)
    else:
        # default it goes by created
        sort['created'] = -1
    sort['_id'] = 1
    return sort

def paginate_results(collection, filter, sort, page, page_size, sortField, sortOrder):
    pipeline = [
                    {'$match': filter},
                    {'$sort' : sort },
                    {'$facet': {
                        'metadata': [ 
                                { '$count': "total" }, 
                                { '$addFields': { 'page': page, 'size': page_size, 'sortBy': sortField, 'order': sortOrder}}
                            ],
                        'data': [ 
                                { '$skip': (page-1)*page_size }, 
                                { '$limit': page_size } 
                            ] 
                        }
                    },
                    # if there aren't records metadata and data appear [], to avoid that, metadata is set again to the value
                    {
                        '$set': {
                            'metadata': {
                                '$cond': {
                                    'if': { '$eq': [{ '$size': "$metadata" }, 0] }, 
                                        'then': [{ 'page': page, 'size': page_size, 'sortBy': sortField, 'order': sortOrder }],
                                    'else': "$metadata"
                                }
                            }
                        }
                    },
                ]

    if sortField in ['upvotes', 'bookmarks', 'positions', 'clubs']:
        # need to retrieve the lenght of the array of the field and insert this stage before the others
        pipeline.insert(0, {"$addFields": {"n"+sortField: { "$size": "$"+sortField }}})

    return list(db[collection].aggregate(pipeline))

def select_strategies(userId, groupId, search, page_number=None, sortField=None, sortOrder=None):
    filter = {'userId': userId}
    
    if groupId is not None and groupId != '':
        filter["groupId"] = groupId


    if page_number is None:
        #this returns all the strategies, still needed for the market page where you select your strategies
        return list(db.strategy.aggregate([
            {"$match": filter},
        ]))
    else: 
        if search is not None and search != '':
            search_match = {"$or": [
                                    {"name": {"$regex": '^'+search, "$options": 'im'}},
                                    {"groupId": {"$regex": '^'+search, "$options": 'im'}},
                                    {"userId": {"$regex": '^'+search, "$options": 'im'}},
                                ]}
        else:
            search_match = {}

        match = { "$and": 
                [ 
                    filter, 
                    search_match,
                ] 
            } 
        sort = sort_get_paginated_results(sortField, sortOrder)
        result = paginate_results('strategy', match, sort, int(page_number), PAGINATION_SIZE_STRATEGIES, sortField, sortOrder)
        return result[0] if len(result) == 1 else None

def select_public_strategies(userId, groupId, search, page_number, sortField, sortOrder):
    userId # not used but needed for view common get function

    filter={'published': True}

    if groupId is not None and groupId != '':
        filter["groupId"] = groupId
    
    if page_number is None:
        return list(db.strategy.aggregate([
            {"$match": filter},
        ]))
    else: 
        if search is not None and search != '':
            search_match = {"$or": [
                                    {"name": {"$regex": '^'+search, "$options": 'im'}},
                                    {"groupId": {"$regex": '^'+search, "$options": 'im'}},
                                    {"userId": {"$regex": '^'+search, "$options": 'im'}},
                                ]}
        else:
            search_match = {}

        match = { "$and": 
                [ 
                    filter, 
                    search_match,
                ] 
            } 
        sort = sort_get_paginated_results(sortField, sortOrder)
        result = paginate_results('strategy', match, sort, int(page_number), PAGINATION_SIZE_STRATEGIES, sortField, sortOrder)
        return result[0] if len(result) == 1 else None

def select_saved_strategies(userId, groupId, search, page_number, sortField, sortOrder):
    # get the list of ids from portfolio
    saved_strategies_ids= list(db.portfolio.aggregate([
        {"$match": {'userId': userId}},
        {"$project": {"other_strategies.saved":1, "_id":0}}
    ]))
    
    strats_id_list = saved_strategies_ids[0]["other_strategies"]["saved"]
    # get the strategies from 'strategy'
    filter = {}

    if groupId is not None and groupId != '':
        filter["groupId"] = groupId

    if page_number is None:
        return list(db.strategy.aggregate([
            {"$match": filter},
        ]))
    else: 
        if search is not None and search != '':
            search_match = {"$or": [
                                    {"name": {"$regex": '^'+search, "$options": 'im'}},
                                    {"groupId": {"$regex": '^'+search, "$options": 'im'}},
                                    {"userId": {"$regex": '^'+search, "$options": 'im'}},
                                ]}
        else:
            search_match = {}

        match = { "$and": 
                    [ 
                        filter, 
                        {"$expr":{"$in":["$_id", strats_id_list]}},
                        search_match
                    ] 
                }
        sort = sort_get_paginated_results(sortField, sortOrder)
        result = paginate_results('strategy', match, sort, int(page_number), PAGINATION_SIZE_STRATEGIES, sortField, sortOrder)
        
        return result[0] if len(result) == 1 else None
    
def select_opened_strategies(userId, groupId, search, page_number, sortField, sortOrder):
    page_number, sortField, sortOrder # not yet used

    # get the list of ids from portfolio
    opened_strategies_ids= list(db.portfolio.aggregate([
        {"$match": {'userId': userId}},
        {"$project": {"other_strategies.opened":1, "_id":0}}
    ]))
    
    strats_id_list = opened_strategies_ids[0]["other_strategies"]["opened"]
    # get the strategies from 'strategy'
    filter = {}

    if groupId is not None and groupId != '':
        filter["groupId"] = groupId
    
    if search is not None and search != '':
        search_match = {"$or": [
                                {"name": {"$regex": '^'+search, "$options": 'im'}},
                                {"groupId": {"$regex": '^'+search, "$options": 'im'}},
                                {"userId": {"$regex": '^'+search, "$options": 'im'}},
                            ]}
    else:
        search_match = {}

    match = { "$and": 
            [ 
                filter, 
                {"$expr":{"$in":["$_id", strats_id_list]}},
                search_match,
            ] 
        } 
    
    return list(db.strategy.aggregate([
        {"$match": match}
    ]))

def select_shared_strategies(userId, groupId, search, page_number, sortField, sortOrder):
    sortField # not yet used
    sortOrder # not yet used

     # get the list of ids from portfolio
    shared_strategies_ids= list(db.portfolio.aggregate([
        {"$match": {'userId': userId}},
        {"$project": {"other_strategies.shared":1, "_id":0}}
    ]))
    
    # list of objects {"from user": string, "strategyId": string}
    strats_user_id_list = shared_strategies_ids[0]["other_strategies"]["shared"]


    # get the strategies from collection 'strategy'
    filter={}

    if groupId is not None and groupId != '':
        filter["groupId"] = groupId
    
    if search is not None and search != '':
        search_match = {"$or": [
                                {"name": {"$regex": '^'+search, "$options": 'im'}},
                                {"creator_userId": {"$regex": '^'+search, "$options": 'im'}}
                            ]}
    else:
        search_match = {}

    results = []
    
    for index,s in enumerate(strats_user_id_list):
        #search for the strategy
        filter["_id"] = s['strategyId']
        element = list(db.strategy.aggregate([ {"$match": filter},  {"$match": search_match} ]))

        #if found, add the user who shared to the strategy , has the same index as the original array
        if(element != []):
            element[0]["from_user"] = strats_user_id_list[index]['from_user']
            results.append(element[0])
    
    # pagination of the array of results, data is pagination done with the indexes of the array. If len is 0 return []
    list_paginated = {
                        "metadata": [
                            {
                                "total": len(results), 
                                "page": int(page_number),
                                "size": PAGINATION_SIZE_STRATEGIES,
                            }
                            ],
                        "data": ([results[i:i+10] for i in range(0, len(results), 10)][int(page_number)-1]) if len(results)>0 else []
                    }
    return list_paginated


def select_my_public_strategies(userId, search):
    filter = {"published": True, "userId": userId}
    
    if search is not None and search != '':
        return list(db.strategy.aggregate([
            {"$match": filter},
            {"$match": {"name": {"$regex": '^'+search, "$options": 'im'}}}
        ]))
    else: return list(db.strategy.aggregate([
            {"$match": filter}
        ]))


# STRATEGY

def insert_strategy(data):
    return db.strategy.insert_one({
        'userId': data["userId"],
        'groupId': data["groupId"],
        'name': data["name"],
        'positions': [],
        'created': get_now(),
        'disabled': False,
        'closed': False,
        'whatif': {
            'enabled': False,
            'volatilityStep': 1,
            'volatilityIncrease': 0,
        },
        'published': data["published"],
        'upvotes': [],
        'bookmarks': [],
        'clubs': []
    })

def remove_strategy(strategy):
    # remove the strategy in every club
    db.club.update_many({
        "strategies": {"$elemMatch": {'_id': str(strategy['_id'])}}
    },{
        "$pull": {"strategies": {'_id': str(strategy['_id'])}},
        '$inc': { 'nstrategies': -1},
    })
    return db.strategy.delete_one({'_id': strategy["_id"], 'userId': strategy["userId"]})

def select_strategy(id):
    strategies = list(db.strategy.aggregate([
        {"$match": {"_id": ObjectId(id)}},
        {"$lookup": get_strategy_group_lookup()},
        {"$project": {
            "_id": 1,
            "groupId": 1,
            "userId": 1,
            "published": 1,
            "upvotes": 1,
            "bookmarks": 1,
            "name": 1,
            "whatif": 1,
            "group": {"$arrayElemAt": ["$groups", 0]},
            "total": {"$cond": { "if": { "$isArray": "$positions" }, "then": { "$size": "$positions" }, "else": 0} },
        }}
    ]))
    return strategies[0] if len(strategies) > 0 else None

def select_strategy_positions(strategy, filter_active=None, filter_status=None):
    price = None
    whatif = strategy["whatif"]

    positions = list(db.strategy.aggregate(get_aggregate_strategy_positions(strategy)))
    
    for position in positions:
        # Update from whatif query params
        if whatif is not None:
            for key in whatif:
                position["whatif"][key] = whatif[key]

        if position["status"] != CLOSE:
            position["volatility"] = get_implied_volatility(position, price_key="startPrice")
            position["timeValue"] = get_time_value(position, price_key="startPrice")

        if price is None or ("template" in position and position["template"] == "index"):
            price = get_security_underlying_price(position)

    return price, list(filter(lambda p: 
                        (filter_active is None or p["active"] == filter_active) and
                        (filter_status is None or p["status"] != filter_status), positions))

## STRATEGY NAME

def save_strategy_name(strategy, name):
    return db.strategy.update_one(
    {
        '_id': strategy["_id"],
        'userId': strategy["userId"],
        'groupId': strategy["groupId"]
    }, {
        '$set': {'name': name}
    }, upsert=False)

## STRATEGY VISIBILITY

def save_strategy_visibility(strategy, visibility):
    return db.strategy.update_one(
    {
        '_id': strategy["_id"],
        'userId': strategy["userId"],
        'groupId': strategy["groupId"]
    }, {
        '$set': {'published': visibility}
    }, upsert=False)

## STRATEGY STATE

def save_strategy_state(strategy, disabled):
    return db.strategy.update_one(
    {
        '_id': strategy["_id"],
        'userId': strategy["userId"],
        'groupId': strategy["groupId"]
    }, {
        '$set': {'disabled': disabled}
    }, upsert=False)


## STRATEGY WHATIF

def save_strategy_whatif(strategy, whatif):
    return db.strategy.update_one(
    {
        '_id': strategy["_id"],
        'userId': strategy["userId"],
        'groupId': strategy["groupId"]
    }, {
        '$set': {'whatif': whatif}
    }, upsert=False)


## STRATEGY POSITION

def select_strategy_security_order(strategy, order):
    # From the contract of the order retrieve security product
    security = None

    if "contract" in order and order["contract"] is not None:
        security = select_future_by_contract(order["contract"])

        if security is None:
            security = select_chain_option_by_contract(order["contract"])
        
        if security is not None:
            market = select_market(security["symbol"])

            if market is None or market["groupId"] != strategy["groupId"]:
                security = None

    return security

def select_strategy_position(strategy, security, order):
    # Select the single position of a strategy (if exist)
    positions = list(db.strategy.aggregate([
        {"$match":{"_id": strategy["_id"], "userId": strategy["userId"]}},
        {"$unwind": "$positions"},
        {"$match": {"positions.id": order["id"]}},
        {"$replaceRoot": {"newRoot": "$positions"}}
    ]))

    if len(positions) == 1:
        position = positions[0]
    else:
        position = new_strategy_position(security, order)

    return set_strategy_position(position, order)

def save_strategy_position(strategy, position, order):
    # Save a single strategy position
    result = None

    if order["operation"] == ADD and position["quantity"] != 0:
        result = insert_strategy_position(strategy, position)

    if order["operation"] == UPDATE:
        result = update_srategy_position(strategy, position)

        if position["status"] == OPEN and position["active"] is True:
            result = open_strategy_position(strategy, position)

        if position["status"] == CLOSE and position["active"] is True:
            result = close_strategy_position(strategy, position)

    if order["operation"] == DELETE:
        result = delete_strategy_position(strategy, position)

    return result

def insert_strategy_position(strategy, position):
    # Add strategy position if not present
    return db.strategy.update_one(
    {
        "_id": strategy["_id"],
        "userId": strategy["userId"],
        "groupId": strategy["groupId"],
    }, {
        "$addToSet": {"positions": position}
    })

def update_srategy_position(strategy, position):
    # Update strategy position if present and temporary
    result = None
    if strategy["whatif"]["enabled"]:
        result = db.strategy.update_one({
            "_id": strategy["_id"],
            "userId": strategy["userId"],
            "groupId": strategy["groupId"],
            "positions": { "$elemMatch": {"id": position["id"]}}
        }, {
            "$set": {
                "positions.$.whatif": position["whatif"],
            }
        })
    else :
        if "startPrice" not in position:
            position["startPrice"] = position["price"]
            
        result = db.strategy.update_one({
            "_id": strategy["_id"],
            "userId": strategy["userId"],
            "groupId": strategy["groupId"],
            "positions": { "$elemMatch": {"id": position["id"]}}
        }, {
            "$set": {
                "positions.$.active": position["active"],
                "positions.$.quantity": position["quantity"],
                "positions.$.price": position["price"],
                "positions.$.startPrice": position["startPrice"],
            }
        })
    return result

def open_strategy_position(strategy, position):
    # Update strategy position if present and want to open (also in whatifs array)
    startDate = get_now()

    return db.strategy.update_one(
    {
        "_id": strategy["_id"],
        "userId": strategy["userId"],
        "groupId": strategy["groupId"],
        "positions": { "$elemMatch": {"id": position["id"], "status": TEMP}}
    }, {
        "$set": {
            "positions.$.status": OPEN,
            "positions.$.startDate": startDate,
            "positions.$.id": f'{position["contract"]}-{get_timestamp(startDate)}'
        }
    })

def close_strategy_position(strategy, position):
    # Update strategy position if present and want to close
    endDate = get_now()
    return db.strategy.update_one(
    {
        "_id": strategy["_id"],
        "userId": strategy["userId"],
        "groupId": strategy["groupId"],
        "positions": { "$elemMatch": {"id": position["id"], "status": OPEN}}
    }, {
        "$set": {
            "positions.$.status": CLOSE,
            "positions.$.endDate": endDate,
            "positions.$.endPrice": position["price"],
            "positions.$.id": f'{position["contract"]}-{get_timestamp(endDate)}'
        }
    })

def delete_strategy_position(strategy, position):
    # Remove strategy position if present and temporary
    return db.strategy.update_one(
    {
        "_id": strategy["_id"],
        "userId": strategy["userId"],
    }, {
        "$pull": {"positions": {"id": position["id"]}}
    })

def new_strategy_position(security, order):
    price = get_security_price(security)
    return {
        "active": True,
        "status": TEMP,      
        "id": order["id"],
        "contract": order["contract"],
        "quantity": order["quantity"],
        "exchange": security["exchange"],
        "symbol": security["symbol"],
        "expiration": security["expiration"],
        "date": security["date"],
        "type": security["type"],
        "strike": security["strike"],
        "price": price,
        "startPrice": price,
        "whatif": {
            "active": True,
            "quantity": order["quantity"],
            "price": price,
            "startPrice": price,
        }
    }

def set_strategy_position(position, order):
    
    if "active" in order and order["active"] is not None:
        position["active"] = order["active"]

    if "status" in order and order["status"] is not None:
        position["status"] = order["status"]

    if "quantity" in order and order["quantity"] is not None:
        position["quantity"] = order["quantity"]

    if "whatif" in order and order["whatif"] is not None:
        for key in order["whatif"]:
            if order["whatif"][key] is not None:
                position["whatif"][key] = order["whatif"][key]

    if "price" in order and order["price"] is not None:
        position["price"] = order["price"]

    if "startPrice" in order and order["startPrice"] is not None:
        position["startPrice"] = order["startPrice"]
    
    return position


def add_stategy_to_history(userId, id):
    HISTORY_SIZE = 10
    opened_elements = list(db.portfolio.aggregate([
        {'$match': {'userId': userId}},
        {'$project': {"other_strategies.opened": 1, "_id":0}}
    ]))
    n_opened_elements = len(opened_elements[0]['other_strategies']['opened'])

    if n_opened_elements == HISTORY_SIZE+1:
        db.portfolio.update_one({
            "userId": userId
        },{
            "$pop": {"other_strategies.opened": -1}
        })

    return db.portfolio.update_one({
        "userId": userId
    },{
        "$addToSet": {"other_strategies.opened": ObjectId(id)}
    })

def share_strategy_to_user(userId, strategyId, user_to_share_to):
   
    #push object {'from_user': userId, 'strategyId': strategyId} so that i can know who sent it to me
    return db.portfolio.update_one({
        "userId": user_to_share_to
    },{
        "$addToSet": {"other_strategies.shared": {'from_user': userId, 'strategyId': ObjectId(strategyId)}}
    })

#---------------------------------------------------------------------------

# CLUBS

def select_my_clubs(userId, search, page_number, sortField, sortOrder):

    clubs_from_portfolio = list(db.portfolio.aggregate([
        {"$match": {'userId': userId}},
        {"$project": {"clubs":1, "_id":0}}
    ]))
    
    club_id_list = clubs_from_portfolio[0]["clubs"]

    filter = {'creator_userId': userId}

    if search is not None and search != '':
        search_match = {"name": {"$regex": '^'+search, "$options": 'im'}}
    else:
        search_match = {}

    match = { "$and": 
            [ 
                filter, 
                {"$expr":{"$in":["$_id", club_id_list]}},
                search_match,
            ] 
        } 
    sort = sort_get_paginated_results(sortField, sortOrder)

    result = paginate_results('club', match, sort, int(page_number), PAGINATION_SIZE_CLUBS, sortField, sortOrder)

    return result[0] if len(result) == 1 else None


def get_clubs_created_by_me(userId):
    return list(db.club.aggregate([
        {"$match": {'creator_userId': userId}},
    ]))

def get_clubs_administrated_by_me(userId):
    return list(db.club.aggregate([
        {'$unwind': '$admins'},
        {"$match": {'admins': userId}},
    ]))

def insert_club(data):
    return db.club.insert_one({
        'creator_userId': data["userId"],
        'name': data["name"],
        'img_path': data["img_path"],
        'published': data["published"],
        'description': data["description"],
        'created': get_now(),
        'upvotes': [],
        'admins': [data["userId"]],
        'members': 1,
        'nstrategies': 0,
        'strategies': [],
        'links': data["links"],
    })

#update the list of groups in portfolio
def add_club_portfolio(userId, clubId):
    return db.portfolio.update_one({
        "userId": userId
    }, {
        "$addToSet": {"clubs": ObjectId(clubId)}
    })

def select_club(id):
    filter = {'_id': ObjectId(id)}
    club = list(db.club.aggregate([
        {"$match": filter},
    ]))

    return club[0] if len(club) == 1 else None

def select_club_from_username_name(username, name):
    filter = {'creator_userId': username, 'name': name}
    club = list(db.club.aggregate([
        {"$match": filter},
    ]))

    return club[0] if len(club) == 1 else None


def update_club_settings(data, id):
    return db.club.update_one(
   { '_id': ObjectId(id) },
   { '$set': { 
       'name': data['name'],
       'published': data['published'],
       'description': data['description'],
       'img_path': data['img_path'],
       'links': data['links']
    } }
)


def get_club_members(clubId):
    users_objs_array = list(db.portfolio.aggregate([
        {"$match": {'clubs': ObjectId(clubId)}},
        {"$project": {"_id": 0, "userId": "$userId"}}
    ]))
    users_str_array = map(lambda user: user['userId'],users_objs_array)
    return users_str_array

def club_members_counter(clubId, quantity):
    return db.club.update_one(
   { '_id': ObjectId(clubId) },
   { '$inc': { 'members': quantity} }
)

def add_club_admin(clubId, userId):
    return db.club.update_one({
        "_id": ObjectId(clubId)
    },{
        "$addToSet": {"admins": userId}
    })

def remove_club_admin(clubId, userId):
    return db.club.update_one({
        "_id": ObjectId(clubId)
    },{
        "$pull": {"admins": userId}
    })

def remove_club_member(userId, clubId):
    return db.portfolio.update_one({
        "userId": userId
    },{
        "$pull": {"clubs": ObjectId(clubId)}
    })

def get_club_strategies(strategiesId):
    return list(db.strategy.aggregate([
            {"$match": {"$expr":{"$in":["$_id", strategiesId]}}}
        ]))

def add_club_strategy(clubId, strategyId):
    #also add clubId to the strategy 
    updated_result = db.strategy.update_one({
        "_id": ObjectId(strategyId)
    },{
        "$addToSet": {"clubs": ObjectId(clubId)}
    })
    if updated_result.modified_count == 1:
        #add entire object of strategy to club strategies
        return db.club.update_one({
            "_id": ObjectId(clubId)
        },{
            "$addToSet": {"strategies": ObjectId(strategyId)},
            '$inc': { 'nstrategies': +1}, 
        })

def remove_club_strategy(clubId, strategyId):
    #also remove clubId to the strategy 
    db.strategy.update_one({
        "_id": ObjectId(strategyId)
    },{
        "$pull": {"clubs": ObjectId(clubId)}
    })

    return db.club.update_one({
        "_id": ObjectId(clubId)
    },{
        "$pull": {"strategies": ObjectId(strategyId)},
        '$inc': { 'nstrategies': -1},
    })

def delete_club(clubId):
    # every strategy that has the club in clubs has to remove it
    db.strategy.update_many({
        "clubs":  clubId
    },{
        "$pull": {"clubs": clubId},
    })
    
    return db.club.delete_one({'_id': ObjectId(clubId)})


# Joined clubs

def select_joined_clubs(userId, search, page_number, sortField, sortOrder ):

    clubs_from_portfolio = list(db.portfolio.aggregate([
        {"$match": {'userId': userId}},
        {"$project": {"clubs":1, "_id":0}}
    ]))
    
    club_id_list = clubs_from_portfolio[0]["clubs"]

    filter = {'creator_userId': {"$not": {"$eq":userId}}}

    if search is not None and search != '':
        search_match = {"$or": [
                                {"name": {"$regex": '^'+search, "$options": 'im'}},
                                {"creator_userId": {"$regex": '^'+search, "$options": 'im'}}
                            ]}
    else:
        search_match = {}

    match = { "$and": 
            [ 
                filter, 
                {"$expr":{"$in":["$_id", club_id_list]}},
                search_match,
            ] 
        } 
    sort = sort_get_paginated_results(sortField, sortOrder)
    result = paginate_results('club', match, sort,  int(page_number), PAGINATION_SIZE_CLUBS, sortField, sortOrder)
    return result[0] if len(result) == 1 else None



# Public clubs

def select_public_clubs(search, page_number, sortField, sortOrder):
    filter = {'published': True}

    if search is not None and search != '':
        search_match = {"$or": [
                                {"name": {"$regex": '^'+search, "$options": 'im'}},
                                {"creator_userId": {"$regex": '^'+search, "$options": 'im'}}
                            ]}
    else:
        search_match = {}
    
    match = { "$and": 
            [ 
                filter, 
                search_match,
            ] 
        } 

    sort = sort_get_paginated_results(sortField, sortOrder)
    result = paginate_results('club', match, sort, int(page_number), PAGINATION_SIZE_CLUBS, sortField, sortOrder)
    return result[0] if len(result) == 1 else None


### ----------------------------------------------
# UPVOTES

def element_vote(db_collection, field, id, userId):
    if field == 'bookmarks':
        db.portfolio.update_one({
            "userId": userId
        },{
            "$addToSet": {"other_strategies.saved": ObjectId(id)}
        })

    return db[db_collection].update_one({
        "_id": ObjectId(id)
    },{
        "$addToSet": { field: userId}
    })

def element_unvote(db_collection, field, id, userId):
    if field == 'bookmarks':
        db.portfolio.update_one({
            "userId": userId
        },{
            "$pull": {"other_strategies.saved": ObjectId(id)}
        })

    return db[db_collection].update_one({
        "_id": ObjectId(id)
    },{
        "$pull": {field : userId}
    })