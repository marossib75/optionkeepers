from scipy.stats import norm
import numpy as np

from utils.time import get_truncated_datetime

def get_time_to_maturity(security, min_date_utc=None):
    date_utc = get_truncated_datetime(security["date"])
    min_date_utc = get_truncated_datetime(min_date_utc)
    return (date_utc - min_date_utc).days / 365

def get_min_date(securities):
    min_date = None
    securities = list(filter(lambda security: get_truncated_datetime(security["date"]) >= get_truncated_datetime(), securities))

    if securities is not None and len(securities) > 0:
        securities.sort(key=lambda security : security["date"])
        security = securities[0]

        if security is not None and security["date"] is not None:
            min_date = get_truncated_datetime(security["date"])

    return min_date

def get_prices(securities):
    max_price = 10

    strike_prices = list(map(lambda security: security["strike"], securities))
    underlying_prices = list(map(lambda security: get_security_underlying_price(security), securities))

    if len(strike_prices) > 0:
        max_price = max(strike_prices)

    if max_price < 1:
        max_price = max(underlying_prices)

    prices = np.unique(np.concatenate((np.array(strike_prices), np.array(underlying_prices), np.linspace(1, max_price*2, 800))), axis=0)
    prices.sort()
    return prices

def get_price_factor(time_to_maturity, security):
    price_factor = 1
    if security["template"] == "index future"\
    or security["template"] == "commodity future"\
    or security["template"] == "bonds future":
        price_factor = np.exp((security["riskFree"]-security["dividendYield"]) * time_to_maturity)
    return price_factor

def get_security_underlying_price(security):
    underlyingPrice = None

    if "underlyingPrice" in security:
        underlyingPrice = security["underlyingPrice"]
    
    return underlyingPrice


def get_security_values(security):
    strike = security["strike"]
    risk_free = security["riskFree"]
    volatility = security["volatility"]

    if security["template"] == "index future"\
    or security["template"] == "commodity future"\
    or security["template"] == "bonds future":
        dividend_yield = security["riskFree"]
    else: 
        dividend_yield = security["dividendYield"]

    return strike, volatility, risk_free, dividend_yield

def get_security_date(security):
    date = None

    if security is not None:
        
        if "endDate" in security:
            date = security["endDate"]

        elif "startDate" in security:
            date = security["startDate"]
    
    return date if date is not None else get_truncated_datetime()


def compute_d1(price, strike, volatility, risk_free, dividend_yield, maturity):
    return (np.log(price / strike) + (risk_free - dividend_yield + 0.5 * volatility**2) * (maturity)) / (volatility * np.sqrt(maturity))

def compute_d2(d1, volatility, maturity):
    return d1 - volatility * np.sqrt(maturity)

def BS_call(price, strike, volatility, risk_free, dividend_yield, maturity):
    bs=0
    if maturity > 0 and strike > 0 and volatility is not None:
        d1 = compute_d1(price, strike, volatility, risk_free, dividend_yield, maturity)
        d2 = compute_d2(d1, volatility, maturity)
        bs = price * norm.cdf(d1) * np.exp(-dividend_yield*maturity) - strike * np.exp(-risk_free * (maturity)) * norm.cdf(d2)
    else:
        bs = max(0, price-strike)
    return bs

def BS_put(price, strike, volatility, risk_free, dividend_yield, maturity):
    bs=0
    if maturity > 0 and strike > 0 and volatility is not None:
        d1 = compute_d1(price, strike, volatility, risk_free, dividend_yield, maturity)
        d2 = compute_d2(d1, volatility, maturity)
        bs = strike * np.exp(-risk_free * (maturity)) * norm.cdf(-d2) - price * norm.cdf(-d1) * np.exp(-dividend_yield*maturity)
    else:
        bs = max(0, strike-price)
    return bs

# TIME VALUE
def time_value_call(price, security, price_key="price"):
    price = security[price_key] if price_key in security else security["price"]
    strike, volatility, risk_free, dividend_yield = get_security_values(security)
    return float(price) - BS_call(price, strike, volatility, risk_free, dividend_yield, 0)

def time_value_put(price, security, price_key="price"):
    price = security[price_key] if price_key in security else security["price"]
    strike, volatility, risk_free, dividend_yield = get_security_values(security)
    return float(price) - BS_put(price, strike, volatility, risk_free, dividend_yield, 0)
