from .mongodb import db
from django.conf import settings

def userProfile(request):
    if request.user.is_authenticated:
        userProfile = db.user.find_one({'_id': request.user.username})
    else:
        userProfile = None

    return {'userProfile': userProfile}

def getHost(request):
    return {'HOST': settings.HOST}