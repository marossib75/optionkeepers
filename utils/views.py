from celery import group
from rest_framework.decorators import api_view
from rest_framework.response import Response

from tasks import *

from .serializers import GetExchangesSerializer, GetGroupsSerializer
from .query import select_exchanges, select_groups

@api_view(['GET'])
def run_tasks(request):
    history = request.query_params.get('history')

    if history is not None and history == 'True':
        update_history.delay()
        message = 'History tasks started'
    else:
        group(
            update_cboe.delay(),
            update_cme.delay(),
            update_eurex.delay(),
        )
        message = 'Exchange tasks started'

    return Response({'message': message})

@api_view(['GET'])
def groups(request):
    groups = select_groups()
    serializer = GetGroupsSerializer(groups, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def excnanges(request):
    exchanges = select_exchanges()
    serializer = GetExchangesSerializer(exchanges, many=True)
    return Response(serializer.data)
