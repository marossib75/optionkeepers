from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from tasks import *
from formulas import *

from chains.query import *
from markets.query import *

from .query import *
from .serializers import *

# USER
@api_view(['GET'])
def user(request):
    user = User.objects.get(username=request.user.username)
    serializer = GetUserSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
def users(request):
    if 'search' in request.GET :
        search = request.query_params.get('search')
        users = select_users(search)
    else:
        users = []
    serializer = GetSearchedUserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def share_strategy_to_users(request):
    response = None
    userId = request.user.username
    if userId is not None:
        strategyId = request.query_params.get('strategyId')
        users = select_users_to_share_strategy(strategyId)
        # filter myself, cant share to me
        users= list(filter(lambda u: u['userId'] != userId, users))
        response = Response(users)
    else:
        response = Response({'message': "User not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response

# PORTOFLIO
@api_view(['GET'])
def portfolio(request):
    response = None
    userId = request.user.username

    portfolio = select_portfolio(userId)
    
    if portfolio is not None:            
        portfolio["stats"] = get_portfolio_stats(portfolio)
        serializer = GetPortfolioSerializer(portfolio)
        response = Response(serializer.data)

    else:
        response = Response({'message': 'Portfolio not found'},
                        status=status.HTTP_404_NOT_FOUND)

    return response


# STRATEGIES
#function that gets stats for each strategy in order to show profit when selecting strategies
def get_stats_for_list_of_strategies(array_of_strat):
    strategies_with_stats = []
    for strategy in array_of_strat:

        # check if there is from_user and saves it
        if "from_user" in strategy:
            from_user = strategy['from_user']

        strategy = select_strategy(strategy['_id'])
        strategy["country"] = select_markets(strategy["groupId"])[0]['country']
        price, positions = select_strategy_positions(strategy)     
        strategy["positions"] = positions
        strategy["price"] = price
        strategy["stats"] = get_strategy_stats(strategy)

        #check the presence of field, because in mobile for now there isn't
        if "upvotes" in strategy: 
            strategy["upvotes"] = len(strategy["upvotes"])
        if "bookmarks" in strategy:
            strategy["bookmarks"] = len(strategy["bookmarks"])

        # have to place it again because 'select strategy' loses this field
        if 'from_user' in locals():
            strategy['from_user'] = from_user
        
        strategies_with_stats.append(strategy)
    return strategies_with_stats


#function to add stats to the array of strats inside the obj for pagination
def get_strategies_stats_also_for_paginated_strategies(paginate_obj, page_number):

    #if page_number is null it means that it retieves all strategies in an array of strategies
    #else i need to get the stats for the paginated strategies that are in a nested array
    if page_number is None:
        strategies_with_stats = get_stats_for_list_of_strategies(paginate_obj)
        serializer = GetStrategiesSerializer(strategies_with_stats, many=True)
    else:
        # if there is pagination the returned result is an object 
        # { "metadata": [ {"total": int, 
        #                  "page": int }
        #                ],
        #   "data": [strategies]
        # } 
        # need to get the stats for the strategies which is a nested array
        paginated_strats = {}
        paginated_strats['metadata'] = paginate_obj['metadata']
        paginated_strats['data'] = get_stats_for_list_of_strategies(paginate_obj['data'])

        serializer = GetStrategiesPaginatedSerializer(paginated_strats)
    return serializer

def get_strategies(request, get_func):
    userId = request.user.username
    if userId is not None:
        response = None
        groupId = request.query_params.get('groupId')
        search = request.query_params.get('search')
        page_number = request.query_params.get('paginationPage')
        sortField = request.query_params.get('sortField')
        sortOrder = request.query_params.get('sortOrder')

        strategies = get_func(userId, groupId, search, page_number, sortField, sortOrder)

        serializer = get_strategies_stats_also_for_paginated_strategies(strategies, page_number)

        response = Response(serializer.data)
    else :
        response = Response({'message': "User not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response


def post_strategies(request):
    userId = request.user.username

    if userId is not None:
        serializer = PostStrategiesSerializer(data=request.data)
        response = None

        if serializer.is_valid():
            data = serializer.validated_data
            data["userId"] = userId
            strategy = insert_strategy(data)

            if strategy.inserted_id is not None:
                save_portfolio_strategy(userId, strategy.inserted_id)

            response = Response({'id': str(strategy.inserted_id)}, status=status.HTTP_201_CREATED)
        
        else:
            response = Response({'message': "Request body is not valid", 'errors': serializer.error_messages},
                        status=status.HTTP_400_BAD_REQUEST)
    else:
        response = Response({'message': "User not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response


@api_view(['GET', 'POST'])
def strategies(request):
    response = None 

    if request.method == 'GET':
        response = get_strategies(request, select_strategies)

    elif request.method == 'POST':
        response = post_strategies(request)

    return response

# PUBLIC STRATEGIES

@api_view(['GET'])
def public_strategies(request):
    response = None 
    
    if request.method == 'GET':
        response = get_strategies(request, select_public_strategies)
    
    return response

# SAVED STRATEGIES

@api_view(['GET'])
def saved_strategies(request):
    response = None 
    
    if request.method == 'GET':
        response = get_strategies(request, select_saved_strategies)
    
    return response

# OPENED STRATEGIES

def add_opened_strategies(request):
    userId = request.user.username

    if userId is not None:
        response = None
        id = request.data['id']
        add_stategy_to_history(userId, id)
        response = Response({'id': {id}}, status=status.HTTP_200_OK)

    else:
        response = Response({'message': "User not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response

@api_view(['GET', 'POST'])
def opened_strategies(request):
    response = None 
    
    if request.method == 'GET':
        response = get_strategies(request, select_opened_strategies)
    
    if request.method == 'POST':
        response = add_opened_strategies(request)
    
    return response

# SHARED with me 

def share_strategy(request):
    userId = request.user.username

    if userId is not None:
        response = None
        strategyId = request.data['strategyId']
        user_to_share_to = request.data['share_to_userId']
        share_strategy_to_user(userId, strategyId, user_to_share_to)
        response = Response({'stratId shared is': {strategyId}}, status=status.HTTP_200_OK)

    else:
        response = Response({'message': "User not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response

def delete_share_strategy(request):
    userId = request.user.username

    if userId is not None:
        response = None
        strategyId = request.query_params.get('strategyId')
        delete_portfolio_other_strategy(strategyId, 'shared', userId)
        response = Response({'message': f'Deleted {strategyId} from my shared strategies'}, status=status.HTTP_200_OK)

    else:
        response = Response({'message': "User not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response

@api_view(['GET', 'POST', 'DELETE'])
def share_strategies(request):
    response = None 
    
    if request.method == 'GET':
        response = get_strategies(request, select_shared_strategies)
    
    if request.method == 'POST':
        response = share_strategy(request)
    
    if request.method == 'DELETE':
        response = delete_share_strategy(request)
    
    return response



# GET MY PUBLIC STRATEGIES (look for strats to add in a club)
def get_my_public_strategies(request):
    userId = request.user.username
    search = request.query_params.get('search')
    strategies = select_my_public_strategies(userId, search)
    strategies_new = get_stats_for_list_of_strategies(strategies)
    serializer = GetStrategiesSerializer(strategies_new, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def my_public_strategies(request):
    response = None 

    if request.method == 'GET':
        response = get_my_public_strategies(request)

    return response



# STRATEGY

def get_strategy(strategy):
    if strategy is not None:
        # Get context info
        strategy["markets"] = select_markets(strategy["groupId"])

        # Get complete info from chain or future for each position
        price, positions = select_strategy_positions(strategy)     
        strategy["positions"] = positions
        strategy["price"] = price

        # Get statistical info about the strategy
        strategy["stats"] = get_strategy_stats(strategy)

    serializer = GetStrategySerializer(strategy, allow_null=True)
    return Response(serializer.data)

def post_strategy(strategy, data):
    message = "Nothing to change"
    code = status.HTTP_200_OK
    errors = []

    serializer = PostStrategySerializer(data=data, allow_null=True)

    if serializer.is_valid():
        data = serializer.validated_data
        securities = []
        orders = []

        if "orders" in data and data["orders"] is not None:
            orders = data["orders"]

            for order in orders:
                security = select_strategy_security_order(strategy, order)

                if security is not None:
                    securities.append(security)
                
        if len(securities) == len(orders):            
            result = None

            for security, order in zip(securities, orders):
                position = select_strategy_position(strategy, security, order)
                result = save_strategy_position(strategy, position, order)

            if "name" in data and data["name"] is not None:
                result = save_strategy_name(strategy, data["name"])
            
            if "published" in data and data["published"] is not None:
                result = save_strategy_visibility(strategy, data["published"])

            if "disabled" in data and data["disabled"] is not None:
                result = save_strategy_state(strategy, data["disabled"])

            if "whatif" in data and data["whatif"] is not None:
                strategy["whatif"] = data["whatif"]
                result = save_strategy_whatif(strategy, data["whatif"])

            if result is not None:
                message = f"Modified {result.modified_count} document/s and saved {len(securities)} orders"
        else:
            message = f"There are some invalid order contracts"
            code = status.HTTP_404_NOT_FOUND

    else:
        message = "Request body is not valid"
        errors = serializer.errors 
        code = status.HTTP_400_BAD_REQUEST
        
    return Response({'message': message, 'errors': errors}, status=code)

def delete_strategy(strategy):
    result = remove_strategy(strategy)
    count = 0
    if result:
        count = result.deleted_count
        if count == 1:
            delete_portfolio_strategy(strategy["userId"], strategy["_id"])
            delete_portfolio_other_strategies(strategy["_id"])
            
    return Response({'message': f'Deleted {count} strategies'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST', 'DELETE'])
def strategy(request, id):
    response = None 

    strategy = select_strategy(id)

    if strategy is not None:

        if request.method == 'GET':
            response = get_strategy(strategy)

        elif request.method == 'POST':
            data = request.data
            response = post_strategy(strategy, data)
        
        elif request.method == 'DELETE':
            response = delete_strategy(strategy)

    else:
        response = Response({'message': 'Strategy not found'},
                        status=status.HTTP_404_NOT_FOUND)
   
    return response

# PROFIT

@api_view(['GET'])
def strategy_profit(request, id):
    response = None 
    userId = request.user.username

    strategy = select_strategy(id)

    if strategy is not None:
        # Select positions with aggregated informations
        price, positions = select_strategy_positions(strategy)

        # Get profits
        profits = get_profits(positions)

        # Search the price index inside the profits
        index = binary_search(profits, price, "price")
    
        serializer = GetStrategyProfitSerializer({"price": price, "index": index, "profits": profits, "isWhatif": strategy["whatif"]["enabled"]}, allow_null=True)
        response = Response(serializer.data, status=status.HTTP_200_OK)

    else:
        response = Response({'message': 'Strategy not found'},
                        status=status.HTTP_404_NOT_FOUND)
   
    return response

# GREEKS

@api_view(['GET'])
def strategy_greeks(request, id):
    response = None 
    userId = request.user.username

    strategy = select_strategy(id)

    if strategy is not None:
        # Get positions and underlying price
        price, positions = select_strategy_positions(strategy)

        # Get greeks
        greeks = get_greeks(positions)

        # Search the price index inside the greeks
        index = binary_search(greeks, price, "price")

        serializer = GetStrategyGreeksSerializer({"index": index, "price": price, "greeks": greeks}, allow_null=True)
        response = Response(serializer.data, status=status.HTTP_200_OK)

    else:
        response = Response({'message': 'Strategy not found'},
                        status=status.HTTP_404_NOT_FOUND)
   
    return response

# UPVOTES generic for every type of vote
def vote(request, id, db_collection, field):
    userId = request.user.username
    if userId is not None:
        type = request.data['voteType']
        if type == 'vote':
            element_vote(db_collection, field, id, userId)
        elif type == 'unvote':
            element_unvote(db_collection, field, id, userId)
        response = Response({'message': f'Upvoted or downvoted element {id} in {db_collection}'}, status=status.HTTP_200_OK)
            
    else:
        response = Response({'message': "User not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response


@api_view(['POST'])
def strategy_upvote(request, id):
    response = None
    if request.method == 'POST':
        response = vote(request, id, 'strategy', 'upvotes')

    return response

# BOOKMARKS
@api_view(['POST'])
def strategy_bookmark(request, id):
    response= None
    if request.method == 'POST':
        response = vote(request, id, 'strategy', 'bookmarks')

    return response




# CLUBS --------------------------------------------------------------------------------

def get_my_clubs(request):
    userId = request.user.username
    search = request.query_params.get('search')
    page_number = request.query_params.get('paginationPage')
    sortField = request.query_params.get('sortField')
    sortOrder = request.query_params.get('sortOrder')

    myClubs = select_my_clubs(userId, search, page_number, sortField, sortOrder)
    serializer = GetClubsPaginatedSerializer(myClubs)

    return Response(serializer.data)

def post_club(request):
    userId = request.user.username

    if userId is not None:
        serializer = PostClubSerializer(data=request.data)
        response = None

        if serializer.is_valid():
            data = serializer.validated_data
            data["userId"] = userId
            club = insert_club(data)

            if club.inserted_id is not None:
                add_club_portfolio(userId, club.inserted_id)

            response = Response({'id': str(club.inserted_id)}, status=status.HTTP_201_CREATED)
        
        else:
            response = Response({'message': "Request body is not valid", 'errors': serializer.error_messages},
                        status=status.HTTP_400_BAD_REQUEST)
    else:
        response = Response({'message': "User not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response


@api_view(['GET', 'POST'])
def clubs(request):
    response = None

    if request.method == 'GET':
        response = get_my_clubs(request)

    elif request.method == 'POST':
        response = post_club(request)
        
    return response


@api_view(['GET'])
def my_club_names(request):
    response= None
    if request.method == 'GET':
        userId = request.user.username
        clubs = get_clubs_created_by_me(userId)
        serializer = GetClubsSerializer(clubs, many=True)
        response = Response(serializer.data)
    return response

# GET one club
def get_members_and_stats_for_strategies_in_club(club):
    club["members_list"] = get_club_members(club['_id'])
    strategies_list = get_club_strategies(club['strategies'])
    strategies_with_stats = get_stats_for_list_of_strategies(strategies_list)
    club["strategies"] = strategies_with_stats
    return club


def get_club(id):
    club = select_club(id)
    if club is not None:
        club = get_members_and_stats_for_strategies_in_club(club)
        serializer = GetClubSerializer(club)
        return Response(serializer.data)
    else:
        return Response({'message': 'Club not found'}, status=status.HTTP_404_NOT_FOUND)

def update_club(request, id):
    serializer = PostClubSerializer(data=request.data)
    if serializer.is_valid():
            data = serializer.validated_data
            update_club_settings(data, id)

            response = Response({f'updated club id: {id}'}, status=status.HTTP_201_CREATED)

    else:
        response = Response({'message': "Request body is not valid", 'errors': serializer.error_messages},
                    status=status.HTTP_400_BAD_REQUEST)
    return response

# DELETE club
def close_club(request, id):
    userId = request.user.username

    if userId is not None:
        result =  delete_club(id)
        count = 0
        if result:
            count = result.deleted_count
            if count==1:
                remove_club_member(userId, id)
        response = Response({'message': f'Closed {count} groups'}, status=status.HTTP_200_OK)
            
    else:
        response = Response({'message': "User not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response


@api_view(['GET', 'POST', 'DELETE'])
def club(request, id):
    response = None
    
    if request.method == 'GET':
        response = get_club(id)
    
    elif request.method == 'POST':
        response = update_club(request, id)
    
    elif request.method == 'DELETE':
            response = close_club(request, id)
    
    return response


def get_club_page(creator_userId, name):
    club = select_club_from_username_name(creator_userId, name)
    if club is not None:
        club = get_members_and_stats_for_strategies_in_club(club)
        serializer = GetClubSerializer(club)
        return Response(serializer.data)
    else:     
        return Response({'message': "Club not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def club_page(request, creator_userId, name):
    response= None
    if request.method == 'GET':
        response = get_club_page(creator_userId, name)
    return response


# Upvotes

@api_view(['POST'])
def club_upvote(request, id):
    response=None
    if request.method == 'POST':
        response = vote(request, id, 'club', 'upvotes')

    return response


# Member management

def add_member(user, clubId):

    if user is not None :
        updated_result = add_club_portfolio(user, clubId)
        if updated_result.modified_count == 1:
            club_members_counter(clubId, +1)
        response = Response({'message': f'Member added to club {clubId}'}, status=status.HTTP_200_OK)
            
    else:
        response = Response({'message': "User not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response

def remove_member(user, clubId):

    if user is not None:
        remove_club_admin(clubId, user)
        updated_result = remove_club_member(user, clubId)
        if updated_result.modified_count == 1:
            club_members_counter(clubId, -1)
        response = Response({'message': f'Member removed to club {clubId}'}, status=status.HTTP_200_OK)
            
    else:
        response = Response({'message': "One or more users not found", 'errors': []},
                        status=status.HTTP_404_NOT_FOUND)
    return response

@api_view(['POST', 'DELETE'])
def club_member(request, id, username):
    response = None 

    if request.method == 'POST':
        response = add_member(username,id)

    elif request.method == 'DELETE':
        response = remove_member(username, id)


    return response

#ADMINS management

def promote_member_to_admin(clubId, username):
    add_club_admin(clubId, username)
    
    return Response({'message': f'Admin {username} added to club {clubId}'}, status=status.HTTP_200_OK)

def demote_admin_to_member(clubId, username):
    remove_club_admin(clubId, username)
    
    return Response({'message': f'Admin {username} demoted in club {clubId}'}, status=status.HTTP_200_OK)


@api_view(['POST', 'DELETE'])
def club_admin(request, id, username):
    response = None 

    if request.method == 'POST':
        response = promote_member_to_admin(id, username)

    elif request.method == 'DELETE':
        response = demote_admin_to_member(id, username)


    return response

@api_view(['GET'])
def clubs_of_admin(request):
    response= None
    if request.method == 'GET':
        userId = request.user.username
        strategyId = request.query_params.get('strategyId')
        clubs = get_clubs_administrated_by_me(userId)
        
        # filter clubs that already have the strategy added
        clubs_filtered = []

        for c in clubs:
            found = False

            if(c['strategies'] == []):
                clubs_filtered.append(c)
            else:
                for sId in c['strategies']:
                    if(found == False):
                        if sId == strategyId:
                            found = True
                if(found==False):
                    clubs_filtered.append(c)

        serializer = GetClubsSerializer(clubs_filtered, many=True)
        response = Response(serializer.data)
    return response



# CLUB STRATEGIES management

def add_strategy_to_club(clubId, strategyId):
    add_club_strategy(clubId, strategyId)
    
    return Response({'message': f'Strategy {strategyId} added to club {clubId}'}, status=status.HTTP_200_OK)

def remove_strategy_to_club(clubId, strategyId):
    remove_club_strategy(clubId, strategyId)
    
    return Response({'message': f'Strategy {strategyId} removed from club {clubId}'}, status=status.HTTP_200_OK)


@api_view(['POST', 'DELETE'])
def club_strategy(request, id, strategyId):
    response = None

    if request.method == 'POST':
        response = add_strategy_to_club(id, strategyId)

    elif request.method == 'DELETE':
        response = remove_strategy_to_club(id, strategyId)


    return response



# Joined Clubs

def get_joined_clubs(request):
    userId = request.user.username
    search = request.query_params.get('search')
    page_number = request.query_params.get('paginationPage')
    sortField = request.query_params.get('sortField')
    sortOrder = request.query_params.get('sortOrder')

    joinedClubs = select_joined_clubs(userId ,search, page_number, sortField, sortOrder)
    serializer = GetClubsPaginatedSerializer(joinedClubs)
    return Response(serializer.data)

@api_view(['GET'])
def joined_clubs(request):
    response=None
    if request.method == 'GET':
        response = get_joined_clubs(request)

    return response

# Public Clubs

def get_public_clubs(request):
    search = request.query_params.get('search')
    page_number = request.query_params.get('paginationPage')
    sortField = request.query_params.get('sortField')
    sortOrder = request.query_params.get('sortOrder')

    publicClubs = select_public_clubs(search, page_number, sortField, sortOrder)
    serializer = GetClubsPaginatedSerializer(publicClubs)

    return Response(serializer.data)

@api_view(['GET'])
def public_clubs(request):
    response=None
    if request.method == 'GET':
        response = get_public_clubs(request)

    return response
