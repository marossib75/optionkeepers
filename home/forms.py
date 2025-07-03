from django import forms
from .models import *
from captcha.fields import CaptchaField

class SignInForm(forms.Form):
    username = forms.CharField(max_length=256)
    password = forms.PasswordInput()

class SignUpForm(forms.Form):
    firstName = forms.CharField(label="First Name", max_length=256)
    lastName = forms.CharField(label="Last Name", max_length=256)
    email = forms.EmailField(label="Email", max_length=256)
    password = forms.PasswordInput(render_value=True)
    captcha = CaptchaField(label="Captcha")