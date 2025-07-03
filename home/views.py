from django.shortcuts import render, redirect
from django.contrib import auth
from django.urls import reverse
from django.contrib.auth.models import User

from django.views.decorators.http import require_POST, require_safe

from users.query import insert_portfolio

from .forms import *


@require_safe
def index(request):
    print("Entered in index with GET request")

    if not request.user.is_anonymous:
        return redirect(reverse('app'))
    else:
        return render(request, 'home/index.html', { 'signUpForm': SignUpForm(), 'signInForm': SignInForm()})

@require_safe
def app(request):
    print("Entered in app with GET request")

    if not request.user.is_anonymous:
        return render(request, 'home/app.html')
    else:
        return redirect(reverse('index'))


@require_POST
def signin(request):
    print("Entered in signin with POST request")

    if 'username' in request.POST and 'password' in request.POST:
        form = SignInForm(request.POST)
        
        if form.is_valid():
            user = auth.authenticate(username=request.POST['username'], password=request.POST['password'])

            if user is not None and user.is_active:
                auth.login(request, user)
                return redirect(reverse('index'))

    return render(request, 'home/index.html', {'signInForm': SignInForm(), 'signUpForm': SignUpForm(), 'signInOutcome': {'success': False, 'msg': 'Invalid authentication'}})


@require_POST
def signout(request):
    auth.logout(request)
    return redirect(reverse('index'))


@require_POST
def signup(request):
    print("Entered in signup with POST request")

    success = True
    msg = 'Registration submitted'
    try:
        form = SignUpForm(request.POST)
        
        if form.is_valid():
            # Register user
            portfolio = insert_portfolio(request.POST.get('email', ''))
            user = User.objects.create_user (
                username = request.POST.get('email', ''),
                first_name = request.POST.get('firstName', ''),
                last_name = request.POST.get('lastName', ''),
                email = request.POST.get('email', ''),
                password = request.POST.get('password', ''),
                portfolio = portfolio.inserted_id,
            )
            user.save()
        else:
            success = False
            msg = 'No valid captha'

    except Exception as e:
        print (e)
        success = False
        msg = 'Something went wrong'
    
    return render(request, 'home/index.html', {'signInForm': SignInForm(), 'signUpForm': SignUpForm(),  'signUpOutcome': {'success': success, 'msg': msg}})

@require_safe
def privacy(request):
    return render(request, 'home/privacy.html')
