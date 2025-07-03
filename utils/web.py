def read_query_params(query_params, fields):
    data = {}

    for field in fields:
        try:
            data[field] = query_params.get(field)
        except Exception as e:
            print(f"Exception on reading params {field}: ", e)
            data[field] = None

    return data