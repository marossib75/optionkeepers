from requests import get

def http_get(url: str, params=None, headers=None, allow_redirects=False):
    result = None

    try:
        print(f"Request GET {url}, params={params}")
        result = get(url=url, params=params, headers=headers, allow_redirects=allow_redirects)
        print(f"Response GET {url}, body={result}")
    except Exception as e:
        print(f"Error on calling GET: {url} with params={params} and headers={headers}")

    return result
