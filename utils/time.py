from datetime import datetime, timedelta

def get_now():
    return datetime.now()

def get_timestamp(date=None):
    if date is None:
        date = get_now()
    return round(date.timestamp() * 1000)

def get_truncated_datetime(date=None):
    
    if date is None:
        date = datetime.now()

    date = date.replace(hour=0, minute=0, second=0, microsecond=0).replace(tzinfo=None)
    
    return date

def get_last_trade_day(day=None):

    if day is None:
        day = datetime.now()

    weekday = day.weekday()
    if weekday == 0 or weekday == 6: 
        # It's monday or sunday, so the last trading date is friday
        idx = (weekday + 1) % 7
        yesterday = day - timedelta(2+idx)
    else:
        # Otherwise the last trade date is yesterday
        yesterday = day - timedelta(1)

    return yesterday

def get_third_friday(year, month):
    """Return date for monthly option expiration given year and
    month
    """
    # The 15th is the lowest third day in the month
    third = datetime(year, month, 15)
    # What day of the week is the 15th?
    w = third.weekday()
    # Friday is weekday 4
    if w != 4:
        # Replace just the day (of month)
        third = third.replace(day=(15 + (4 - w) % 7))
    return third

def get_string_to_datetime(date_string: str, format="%Y-%m-%d"):
    date = None

    try:
        date = datetime.strptime(date_string, format)
    except Exception as e:
        print(f"Exception on transform {date_string} to date: ", e)
        date = None

    return date

def get_timestamp_to_datetime(timestamp: str):
    date = None

    try:
        if timestamp is not None and len(timestamp) >=10:
            date = datetime.fromtimestamp(float(timestamp[0:10]))
    except Exception as e:
        print(f"Exception on transform {timestamp} to date: ", e)
        date = None

    return date

def get_timestamp_to_date(timestamp: str):
    return get_truncated_datetime(get_timestamp_to_datetime(timestamp))

def get_datetime_to_string(date: datetime, format="%Y-%m-%d"):
    date_string = None

    try:
        date_string = datetime.strftime(date, format)
        
    except Exception:
        print(f"Exception on transform {date} to string")
        date_string = ""

    return date_string

def get_trade_month(day=None):
    if day is None:
        day = datetime.now()
    return (day.month//3) * 3 + 3

def get_last_trading_date_format(format="%Y%m%d"):
    return get_datetime_to_string(get_last_trade_day(), format=format)

def get_current_year_string():
    return get_datetime_to_string(datetime.now(), format="%Y")

def sub_days(date: datetime, days: int = 1):
    try:
        date = date - timedelta(days=days)
    except Exception:
        print(f"Exception on subtract days {days} to date: {date}")

    return date