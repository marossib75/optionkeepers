import { CountryType } from "../enums/country-type.enum";

export const getCountryMoneyFormat = (country, number=0) => {
    var money = "0";
    switch (country) {
        case CountryType.USA:
            money = new Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' }).format(number);
            break;
        case CountryType.EUR:
            money = new Intl.NumberFormat('en-EN', { style: 'currency', currency: 'EUR' }).format(number);
            break;
        case CountryType.GER:
            money = new Intl.NumberFormat('en-EN', { style: 'currency', currency: 'EUR' }).format(number);
            break;
        default:
            break;
    }

    return money;
}

export const getCurrencyMoneyFormat = (currency, number=0) => {
    return new Intl.NumberFormat('en-EN', { style: 'currency', currency }).format(number ? number : 0);
}
