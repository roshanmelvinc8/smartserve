def get_next_token(db, service: str) -> str:
    """Return next token_number for a service (prefix-number).

    Service must be one of: Bonafide, Transfer, Fee
    """
    prefixes = {'Bonafide': 'B', 'Transfer': 'T', 'Fee': 'F'}
    if service not in prefixes:
        raise ValueError('invalid service')
    prefix = prefixes[service]

    # look up recent tokens for this service and compute next numeric suffix
    docs = list(db.tokens.find({'service': service}, {'token_number': 1}).sort('created_at', -1).limit(100))
    max_num = 0
    for d in docs:
        tn = d.get('token_number', '')
        try:
            num = int(tn.split('-', 1)[1])
            if num > max_num:
                max_num = num
        except Exception:
            continue

    next_num = max_num + 1
    return f"{prefix}-{next_num}"
