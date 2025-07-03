from py_vollib_vectorized import vectorized_implied_volatility
from tasks import CALL, FUTURE, PUT

from .base import *
from .greeks import *

MAX_ITERATIONS = 100
MIN_TIME_VALUE = 0
MIN_PRICE = 0.01

# IMPL. VOLATILITY
def get_implied_volatility(security, price_key="price"):
    volatility = None

    timeToMaturity = get_time_to_maturity(security)

    if timeToMaturity > 0:
        underlyingPrice = get_security_underlying_price(security)
        strikePrice = security["strike"]
        price = security[price_key] if price_key in security else security["price"]
        riskFree = 0

        if price is not None and price > MIN_PRICE:

            if security["type"] == CALL:
                volatility = vectorized_implied_volatility(price, underlyingPrice, strikePrice, timeToMaturity, riskFree, 'c', return_as="array")[0]
            elif security["type"] == PUT:
                volatility = vectorized_implied_volatility(price, underlyingPrice, strikePrice, timeToMaturity, riskFree, 'p', return_as="array")[0]
                
    if volatility is not None:

        if np.isnan(volatility):
            volatility = None
            
        else:
            volatility = round(volatility, 3)

    return volatility

## TIME VALUE

def get_time_value(security, price_key="price"):
    time_value = None

    if security["type"] != FUTURE:
        underlying_price = get_security_underlying_price(security)

        if underlying_price is not None:

            if security["type"] == CALL:
                time_value = time_value_call(underlying_price, security, price_key)
                    
            elif security["type"] == PUT:
                time_value = time_value_call(underlying_price, security, price_key)

    return MIN_TIME_VALUE if time_value is None or np.isnan(time_value) else time_value

## VARIATION

def get_options_volatility_variation(options, prev_options):
    variation_volatility = []

    for option, prev_option in zip(options, prev_options):
        prev_volatility_call = get_implied_volatility(prev_option['call']) or 1
        prev_volatility_put = get_implied_volatility(prev_option['put']) or 1

        volatility_call = get_implied_volatility(option['call']) or 1
        volatility_put = get_implied_volatility(option['put']) or 1

        variation = {
            'strike': option["strike"],
            'var_put': min(((volatility_put/prev_volatility_put) - 1) * 100, 100),
            'var_call': min(((volatility_call/prev_volatility_call) - 1) * 100, 100)
        }

        variation_volatility.append(variation)
    
    return variation_volatility


## HISTORICAL VOLATILITY

def get_window_volatility(window, logreturns,index):
    value = np.std(logreturns[index-(window-1):index+1])*np.sqrt(252)

    if value is None or np.isnan(value):
        value = None

    return value * 100

def get_historical_volatility(history):
    logreturns=[None,]
    historical_vol=[]

    if "days" in history and len(history["days"]) > 0:
        for i in range(1,len(history['days'])):
            day=history['days'][i]
            yesterday=history['days'][i-1]
            if day['close']==None:
                day['close']=yesterday['close']
            logret=np.log(day['close']/ yesterday['close'])
            logreturns.append(logret)      
            historical_vol.append({
                'date': day['date'],
                'vol_21': get_window_volatility(21, logreturns,i) if i>=21 else None,
                'vol_42': get_window_volatility(42, logreturns,i) if i>=42 else None,
                'vol_63': get_window_volatility(63, logreturns,i) if i>=63 else None
                })    
       
    return historical_vol

