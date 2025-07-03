from tasks import FUTURE
from tasks.base import TEMP
from utils.converter import convert_currency
from utils.time import get_datetime_to_string, sub_days
from copy import copy

from .base import get_security_date

def calculate_position_stats(position, stats):
    value = position["quantity"] * position["exposition"]

    if "startPrice" in position:
        position["cost"] = value * position["startPrice"]
    else:
        position["cost"] = value * position["price"]

    if "endPrice" in position:

        if position["endPrice"] is None:
            position["endPrice"] = position["price"]

        position["possibleROI"] = value * position["endPrice"]
        position["effectiveROI"] = position["possibleROI"]
    else:
        position["possibleROI"] = value * position["price"]
        position["effectiveROI"] = 0

    position["profit"] = position["effectiveROI"] - position["cost"]

    if position["active"] is True:
       stats["cost"] = stats["cost"] + position["cost"]
       stats["possibleROI"] = stats["possibleROI"] +  position["possibleROI"]
       stats["effectiveROI"] = stats["effectiveROI"] + position["effectiveROI"]

def get_strategy_stats(strategy):
    stats = { "original": {
        "cost": 0,
        "possibleROI": 0,
        "effectiveROI": 0,
    }, "whatif": {
        "cost": 0,
        "possibleROI": 0,
        "effectiveROI": 0,  
    }}

    if strategy is not None and "positions" in strategy:
        positions = strategy["positions"] or []
    
        for position in positions:
            if "contract" in position and position["type"] != FUTURE:
                calculate_position_stats(position, stats["original"])

                if strategy["whatif"]["enabled"]:
                    position_whatif = copy(position)
                    for key in position["whatif"]:
                        position_whatif[key] = position["whatif"][key]
                    calculate_position_stats(position_whatif, stats["whatif"])
                    
    return stats

def get_portfolio_stats(portfolio):

    stats = {
        "cost": 0,
        "possibleROI": 0,
        "effectiveROI": 0,
        "performance": []
    }

    if "strategies" in portfolio:
        currency = portfolio["currency"]
        value = portfolio["value"]
        created = portfolio["created"]
        performance = {}

        for i in range(0, 30):
            date = get_datetime_to_string(created)
            performance[date] = {'date': date, 'profit': value}
            created = sub_days(created)

        for strategy in portfolio["strategies"]:
            strategy["stats"] = {"cost": 0, "possibleROI": 0,"effectiveROI": 0}

            if "group" in strategy and "currency" in strategy["group"]:

                strategy_currency = strategy["group"]["currency"]
            
                for position in strategy["positions"]:
                    
                    if "contract" in position and position["type"] != FUTURE:
                        calculate_position_stats(position, strategy["stats"])

                        date = get_datetime_to_string(get_security_date(position))

                        if not date in performance:
                            performance[date] = {'date': date, 'profit': value}
                            
                    if position["status"] != TEMP and strategy["disabled"] is False:
                        
                        performance[date]["profit"] += convert_currency(position["profit"], strategy_currency, currency)

                if strategy["disabled"] is False:

                    stats["cost"] = stats["cost"] + convert_currency(strategy["stats"]["cost"], strategy_currency, currency)
                    stats["possibleROI"] = stats["possibleROI"] +  convert_currency(strategy["stats"]["possibleROI"], strategy_currency, currency)
                    stats["effectiveROI"] = stats["effectiveROI"] + convert_currency(strategy["stats"]["effectiveROI"], strategy_currency, currency)

        performance = list(performance.values())
        performance.sort(key=lambda p: p["date"])
        stats["performance"] = performance
    return stats


def get_chain_oi_cumulative(chain):
    options = chain['options']

    cumulative_openint = []
    total_openint_call = 0
    total_openint_put = 0
    # total_openint_call_otm = 0
    # total_openint_put_itm = 0

    total_openint_call = sum( o['call']['openInterest'] for o in options)
    total_openint_put = sum( o['put']['openInterest'] for o in options)

    cumulative_put = total_openint_put
    cumulative_call = 0

    for option in options :
        cumulative = {
            'strike': option['strike'],
            'openint_call': 0, 
            'openint_put': 0,            
            'breakdown_call': 0,
            'breakdown_put': 0,
            'pressure_call': 0,
            'pressure_put': 0
        }
        call_oi =  option['call']['openInterest'] or 0
        put_oi = option['put']['openInterest'] or 0

        cumulative_call += call_oi

        cumulative['openint_call'] = cumulative_call
        cumulative['openint_put'] = cumulative_put 

        cumulative_put -= put_oi            
        
        cumulative_openint.append(cumulative)
    
    for cumulative in cumulative_openint:
        if total_openint_call > 0:       
            cumulative['pressure_call'] = (cumulative['openint_call'] / total_openint_call) * 100
            cumulative['breakdown_call'] = (cumulative['openint_call'] / total_openint_call) * 100
        
        if total_openint_put > 0:
            cumulative['pressure_put'] = (cumulative['openint_put'] / total_openint_put) * 100
            cumulative['breakdown_put']= (cumulative['openint_put'] / total_openint_put) * 100
             
    return cumulative_openint
