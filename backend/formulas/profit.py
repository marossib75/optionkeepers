from tasks import CLOSE, CALL, FUTURE, PUT
from utils.time import get_string_to_datetime

from .base import *

def profit_call(price, position, time_to_maturity):
    start_price = position["startPrice"] if "startPrice" in position else position["price"]
    strike, volatility, risk_free, dividend_yield = get_security_values(position)
    profit = BS_call(price,  strike, volatility, risk_free, dividend_yield, time_to_maturity) - float(start_price)
    if profit is None or np.isnan(profit):
        profit = 0
    return profit

def profit_put(price, position, time_to_maturity):
    start_price = position["startPrice"] if "startPrice" in position else position["price"]
    strike, volatility, risk_free, dividend_yield = get_security_values(position)
    profit = BS_put(price, strike, volatility, risk_free, dividend_yield, time_to_maturity) - float(start_price)
    if profit is None or np.isnan(profit):
        profit = 0
    return profit


def profit_at_time(price, position, start_date=None):
    profit = 0

    if position["status"] != CLOSE:
    
        time_to_maturity = get_time_to_maturity(position, start_date)
        
        if time_to_maturity >= 0:

            price_factor = get_price_factor(time_to_maturity, position)

            if position["type"] == CALL:
                profit = profit_call(price_factor * price, position, time_to_maturity)
            
            elif position["type"] == PUT:
                profit = profit_put(price_factor * price, position, time_to_maturity)
        
            elif position["type"] == FUTURE:
                start_price = position["startPrice"] if "startPrice" in position else position["price"]
                profit = price - start_price
            
            profit = profit * position["quantity"] *  position["exposition"]

    return profit

def invert_position_whatif(position):
    for key in position["whatif"]:
        tmp = position[key] if key in position else None
        position[key] = position["whatif"][key]
        if tmp is not None:
            position["whatif"][key] = tmp

def get_profits(positions):
    profits = []
    active_positions = []

    if len(positions) > 0:

        # Remove close and inactive positions for the payoff
        for position in positions:
            if position["status"] != CLOSE and \
            ((not position["whatif"]["enabled"] and position["active"] is True and position["quantity"] != 0) or\
            (position["whatif"]["enabled"] and position["whatif"]["active"] is True and position["whatif"]["quantity"] != 0)):
                active_positions.append(position)

    if len(active_positions) > 0:
        # For having a large intervale is better to consider all positions
        prices = get_prices(positions)

        # The near expiration date
        min_date = get_min_date(active_positions)

        for price in prices:
            profit = {"at_now": 0,"at_exp": 0,"at_now_wif": 0,"at_exp_wif": 0,"price": price}

            for position in active_positions:

                if position["active"] is True and position["quantity"] != 0:
                    profit["at_now"] += profit_at_time(price, position)
                    profit["at_exp"] += profit_at_time(price, position, min_date)

                if position["whatif"]["enabled"] and position["whatif"]["active"] is True and position["whatif"]["quantity"] != 0:
                    invert_position_whatif(position)
                    start_date = get_string_to_datetime(position["startFromDate"]) if "startFromDate" in position else None
                    profit["at_now_wif"] += profit_at_time(price, position, start_date)
                    profit["at_exp_wif"] += profit_at_time(price, position, min_date)
                    invert_position_whatif(position)

            profits.append(profit)

    return profits
