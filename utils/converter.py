from currency_converter import CurrencyConverter

cc = CurrencyConverter()

def convert_currency(value, currency: str, new_currency: str = "EUR"):
    new_value = None
    if value is not None:
        new_value = cc.convert(value, currency, new_currency)
    return new_value