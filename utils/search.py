
def binary_search(items, value, key=None, sort=False):
    if sort:
        items.sort(key=lambda i : i[key])

    first = 0
    mid = 0
    last = len(items)-1
    index = -1
    while (first <= last) and (index == -1):
        mid = (first + last)//2
        midValue = items[mid][key] if key is not None else items[mid]
        if midValue == value:
            index = mid
        else:
            if value < midValue:
                last = mid -1
            else:
                first = mid +1
    if index == -1:
        index = mid
    return index