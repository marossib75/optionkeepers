from django.shortcuts import render

# Create your views here.
from .mongodb import connections, connection, db, to_json
from django.conf import settings

def normalizePagResult (documents):
    if len(documents['count']) == 0:
        documents['count'] = 0
    else:
        documents['count'] = documents['count'][0]['count']
    return documents

def paginate(doc, userAccess, start= 0, length = settings.REST_FRAMEWORK['PAGE_SIZE'], startFilter={}, filter={}, distinct=None, draw=1):
    print (doc)

    finalFilter = {**startFilter, **filter}

    aggregationPipeline = [
        { '$match': startFilter }
    ]
    aggregationPipelineFilter = [
        { '$match': finalFilter }
    ]

    if userAccess is not None:
        redactStage = {
            '$match': {'$or': [ 
                {'acl.w': {'$exists': True, '$in': userAccess} }, 
                {'acl':{'$exists':False}}, 
                {'acl.w': {'$size':0 }}
            ]}
        }
        
        '''
        { '$redact': {
                '$cond': {
                    'if': {
                        '$gt': [ {'$size': { '$ifNull': [
                            {
                            '$setIntersection': 
                                [ "$acl.w", 
                                userAccess 
                                ] 
                            }, [] ]
                        } }, 0]
                    },
                    'then': "$$KEEP",
                    'else': "$$PRUNE"
                    }
                }
            }
        '''
        aggregationPipeline.append(redactStage)
        aggregationPipelineFilter.append(redactStage)
    
    paginationStage = {'$facet': {
            'data': [ { '$skip': start }, { '$limit': length } ],
            'count': [ {'$count': 'count'} ]
            }
    }
    if distinct:
        distinct = distinct.split('|')
        if len(distinct) == 1:
            aggregationPipeline.append({'$group': {'_id': '$' + distinct[0] }})
            aggregationPipelineFilter.append({'$group': {'_id': '$' + distinct[0] }})
        else:
            groupDict = {}
            for d in distinct:
                groupDict[d.replace('.', '_')] = '$' +d
            aggregationPipeline.append({'$group': {'_id': groupDict} } )
            aggregationPipelineFilter.append({'$group': {'_id': groupDict}})
    
    aggregationPipeline.append(paginationStage)
    aggregationPipelineFilter.append(paginationStage)


    documentsTotal = db[doc].aggregate(aggregationPipeline)
    documents = db[doc].aggregate(aggregationPipelineFilter)

    documentsTotal = normalizePagResult(list(documentsTotal)[0])
    documents = normalizePagResult(list(documents)[0])

    resp = {
        'recordsTotal': documentsTotal['count'],
        'recordsFiltered': documents['count'],
        'data': to_json(documents['data']),
        'draw':draw
    }
    print (resp)
    return resp


class Statement:

    def __init__(self, user, query= None, writeOnly=True):
        self.query = {}
        if query:
            self.query = query
        self.user = user
        self._genFilterAccess(writeOnly)

    def _genFilterAccess(self, writeOnly):
        if writeOnly:
            self.query['acl.w'] =  {'$exists': True, '$in': self.user['acl']['w']}
        else:
            self.query['$or'] =  [ {'acl.w': {'$exists': True, '$in': self.user['acl']['w']}},  {'acl.r': {'$exists': True, '$in': self.user['acl']['w']}}] 
    
    def addCondition(self, conditions):
        self.query.update(conditions)

    def getQuery(self):
        return self.query

        

def select_groups():
    return db.group.find({})

def select_group(symbol):
    groups = list(db.group.aggregate([
        {"$match": {"symbol": symbol}},
        {"$project": {
            "_id": 0,
        }}
    ]))

    return groups[0] if len(groups) == 1 else None

def select_exchanges():
    return db.exchange.find({})

def select_exchange(symbol):
    exchanges = list(db.exchange.aggregate([
        {"$match": {"symbol": symbol}},
        {"$project": {
            "_id": 0,
        }}
    ]))

    return exchanges[0] if len(exchanges) == 1 else None