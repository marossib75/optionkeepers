

from tasks import PUT, CALL, FUTURE, CLOSE

from utils.time import get_string_to_datetime

from .base import *

MIN_GREEK = 0

def delta_call(d1, security, time_to_maturity):
    _, _, _, dividend_yield = get_security_values(security)
    return norm.cdf(d1)*np.exp(-dividend_yield * time_to_maturity)
    
def delta_put(d1, security, time_to_maturity):
    _, _, _, dividend_yield = get_security_values(security)
    return (-norm.cdf(-d1))*np.exp(-dividend_yield*time_to_maturity)

def delta_future(security, time_to_maturity):
    return 1

def delta_at_now(d1, security, time_to_maturity):
    delta = MIN_GREEK

    if security["type"] == CALL:
        delta = delta_call(d1, security, time_to_maturity)
    
    elif security["type"] == PUT:
        delta = delta_put(d1, security, time_to_maturity)

    elif security["type"] == FUTURE:
        delta = delta_future(security, time_to_maturity)
        
    return delta

def gamma_call_put(d1, price, security, time_to_maturity):
    _, volatility, _, dividend_yield = get_security_values(security)
    return np.exp(-dividend_yield * time_to_maturity) * norm.pdf(d1) / (price * volatility * (np.sqrt(time_to_maturity)))

def gamma_at_now(d1, price, security, time_to_maturity):
    gamma = 0

    if security["type"] == CALL or security["type"] == PUT:
        gamma = gamma_call_put(d1, price, security, time_to_maturity)

    return gamma*100
    

##THETA
def theta_call(d1, d2, price, security, time_to_maturity):
    strike, volatility, risk_free, dividend_yield = get_security_values(security)
    return (-(np.exp(-dividend_yield*time_to_maturity)*(price*norm.pdf(d1))*volatility)/(2*np.sqrt(time_to_maturity)) -  risk_free*strike*np.exp(-risk_free*time_to_maturity)*norm.cdf(d2)+dividend_yield*price*np.exp(-dividend_yield*time_to_maturity)*norm.cdf(d1) )/365

def theta_put(d1, d2, price, security, time_to_maturity):
    strike, volatility, risk_free, dividend_yield = get_security_values(security)
    return (-(np.exp(-dividend_yield*time_to_maturity)*price*norm.pdf(d1)*volatility)/(2*np.sqrt(time_to_maturity)) + risk_free*strike*np.exp(-risk_free*time_to_maturity)*norm.cdf(-d2)-dividend_yield*price*np.exp(-dividend_yield*time_to_maturity)*norm.cdf(-d1) )/365

def theta_at_now(d1, d2, price, security, time_to_maturity):
    theta = 0

    if time_to_maturity > 0:

        if security["type"] == CALL:
            theta = theta_call(d1, d2, price, security, time_to_maturity)
        
        elif security["type"] == PUT:
            theta = theta_put(d1, d2, price, security, time_to_maturity)
        
    return theta

##VEGA
def vega_call_put(d1, price, security, time_to_maturity):
    _, _, _, dividend_yield = get_security_values(security)
    return price * np.exp(-dividend_yield * time_to_maturity) * norm.pdf(d1) * np.sqrt(time_to_maturity)*0.01

def vega_at_now(d1, price, security, time_to_maturity):
    vega = 0

    if security["type"] == CALL or security["type"] == PUT:
        vega = vega_call_put(d1, price, security, time_to_maturity)

    return vega

##RHO

def rho_call(d2, security, time_to_maturity):
    strike, _, risk_free, _ = get_security_values(security)
    return strike*time_to_maturity*np.exp(-risk_free*time_to_maturity)*norm.cdf(d2)

def rho_put(d2, security, time_to_maturity):
    strike, _, risk_free, _ = get_security_values(security)
    return -strike*time_to_maturity*np.exp(-risk_free*time_to_maturity)*norm.cdf(-d2)  #*0.01

def rho_at_now(d2, security, time_to_maturity):
    rho = 0
    if security["type"] == CALL:
        rho = rho_call(d2, security, time_to_maturity)
    
    elif security["type"] == PUT:
        rho = rho_put(d2, security, time_to_maturity)

    return rho

##VANNA
def vanna_call_put(d1, d2, security, time_to_maturity):
    _, volatility, _, dividend_yield = get_security_values(security)
    vanna = np.exp(-dividend_yield*(time_to_maturity))*norm.pdf(d1)*(d2/volatility)

    return MIN_GREEK if vanna is None or np.isnan(vanna) else vanna

def vanna_at_now(d1, d2, security, time_to_maturity):
    vanna = 0

    if security["type"] == CALL or security["type"] == PUT:
        vanna = vanna_call_put(d1, d2, security, time_to_maturity)
        
    return vanna

##VOMMA

def vomma_call_put(d1, d2, price, security, time_to_maturity):
    _, volatility, _, dividend_yield = get_security_values(security)
    return price*np.exp(-dividend_yield*(time_to_maturity))*np.sqrt(time_to_maturity)*norm.pdf(d1)*d1*d2/volatility

def vomma_at_now(d1, d2, price, security, time_to_maturity):   
    vomma = 0
    if security["type"] == CALL or security["type"] == PUT:
        vomma = vomma_call_put(d1, d2, price, security, time_to_maturity)
    return vomma/100
    
###GREEKS

def get_greeks(securities):
    greeks = []
    active_securities = []

    if len(securities) > 0:
        
        # Remove close and inactive positions for the payoff
        for security in securities:
            if security["status"] != CLOSE and \
            ((not security["whatif"]["enabled"] and security["active"] is True and security["quantity"] != 0) or\
            (security["whatif"]["enabled"] and security["whatif"]["active"] is True and security["whatif"]["quantity"] != 0)):
                
                if security["whatif"]["enabled"]:
                    for key in security["whatif"]:
                        security[key] = security["whatif"][key]

                active_securities.append(security)
            
    if len(active_securities) > 0:
        prices = get_prices(securities)

        for price in prices:
            greek = {"price": price, "delta": 0, "gamma": 0, "theta": 0, "vega": 0, "rho": 0, "vanna": 0, "vomma": 0 }

            for security in active_securities:
                start_date = get_string_to_datetime(security["startFromDate"]) if "startFromDate" in security else None

                time_to_maturity = get_time_to_maturity(securities[0], start_date)
                strike, volatility, risk_free, dividend_yield = get_security_values(security)

                if time_to_maturity > 0 and strike > 0 and volatility is not None:
                    price_factor = price * get_price_factor(time_to_maturity, securities[0])
                    
                    d1 = compute_d1(price_factor, strike, volatility, risk_free, dividend_yield, time_to_maturity)
                    d2 = compute_d2(d1, volatility, time_to_maturity)

                    quantity = security["quantity"]
                    proportion=security['proportion']
    
                    greek["delta"] += proportion*quantity * delta_at_now(d1, security, time_to_maturity)
                    greek["gamma"] += proportion*quantity * gamma_at_now(d1, price_factor, security, time_to_maturity)
                    greek["theta"] += proportion*quantity * theta_at_now(d1, d2, price_factor, security, time_to_maturity)
                    greek["vega"] += proportion*quantity * vega_at_now(d1, price_factor, security, time_to_maturity)
                    greek["rho"] += proportion*quantity * rho_at_now(d2, security, time_to_maturity)
                    greek["vanna"] +=proportion* quantity * vanna_at_now(d1, d2, security, time_to_maturity)
                    greek["vomma"] += proportion*quantity * vomma_at_now(d1, d2, price_factor, security, time_to_maturity)

            greeks.append(greek)

    return greeks 

