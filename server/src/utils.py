from datetime import datetime, timedelta
from src.errors import Http422Exception
import json


COUNTRY_MAPPING = json.loads(open("data/country_mapping.json").read())

def map_to_country(code):
    return code

def map_to_country_old(code):
    code = code.upper()
    for mapping_name, mapping in COUNTRY_MAPPING.items():
        if code in mapping:
            return mapping[code]

    raise Http422Exception("Invalid country code.")


def parse_date(d):
    date_parsed = None
    try:
        date_parsed = datetime.strptime(d, "%m%d%y")
    except Exception as ex:
        pass

    if not date_parsed:
        try:
            date_parsed = datetime.strptime(d, "%m%d%Y")
        except Exception as ex:
            pass

    if not date_parsed:
        try:
            date_parsed = datetime.strptime(d, "%m-%d-%Y")
        except Exception as ex:
            pass
    if not date_parsed:
        try:
            date_parsed = datetime.strptime(d, "%m-%d-%y")
        except Exception as ex:
            pass

    if not date_parsed:
        raise Http422Exception("Invalid date.")
    return date_parsed

def date_to_string(d):
    date_str = d.strftime("%#m/%#d/%y")
    if date_str[0] == "0":
        date_str = date_str[1:]
    return d.strftime("%Y-%m-%d")

def format_date_string(d):
    return date_to_string(parse_date(d))

def date_range(*args):
    if len(args) == 1:
        start_date = datetime(2020, 1, 26)
        end_date = args[0]
    elif len(args) == 2:
        start_date = args[0]
        end_date = args[1]
    else:
        raise Exception("Too many arguments for date_range")

    date_range = (end_date - start_date).days
    if date_range < 1:
        raise Http422Exception("Invalid date range.")
    date_range = [date_to_string(start_date+timedelta(days=i)) for i in range(date_range)]
    return date_range
