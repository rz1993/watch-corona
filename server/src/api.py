from flask import Blueprint, abort, jsonify, request
from datetime import datetime, timedelta
from src.controller import DataTable
from src.db import table_country, table_city, table_state
from src.utils import parse_date, date_to_string, format_date_string, date_range, map_to_country
import json
import pandas as pd
import re


country_controller = DataTable(table_country, main_key='country_region', keys_denorm=['country_region'])
state_controller = DataTable(table_state, main_key='province_state', keys_denorm=['country_region', 'province_state'])
city_controller = DataTable(table_city, main_key='city', keys_denorm=['country_region', 'province_state', 'city'])

FIRST_DATE = datetime(year=2020, month=1, day=20)

def create_api(name, controller):
    api = Blueprint(f'{name}_api', name)
    
    @api.route('/keys')
    def keys():
        return jsonify({
            'data': controller.all_keys()
        })

    @api.route('/change')
    def change():
        if not request.args or 'value' not in request.args:
            abort(400, 'Missing request arguments.')

        if 'date' in request.args:
            date = parse_date(request.args['date'])
        else:
            date = controller.newest_date()

        data = controller.timeline(
            request.args['value'],
            start_date=date-timedelta(days=1),
            end_date=date
        )
        day_before, day_of = data
        result = {
            stat_type: {
                'change': day_of[stat_type] - day_before[stat_type],
                'changePercent': (day_of[stat_type] - day_before[stat_type]) / day_before[stat_type] * 100 if day_before[stat_type] > 0 else 0,
                'dayOf': day_of[stat_type],
                'dayBefore': day_before[stat_type]
            } for stat_type in ['confirmed', 'deaths', 'recovered', 'active']
        }
        return jsonify({
            'data': result
        })


    @api.route('/newest')
    def newest():
        sort_by = None
        ascending = True
        if 'sortBy' in request.args:
            sort_by = request.args['sortBy']
            ascending = False

        data = controller.newest(
            sort_by=sort_by,
            ascending=ascending
        )
        return jsonify({
            'data': data
        })

    @api.route('/difference')
    def difference():
        args = request.args
        kwargs = {}
        if 'value' not in args:
            abort(400, "Missing request arguments.")

        stat = args.get('stat', 'confirmed')
        data = controller.daily_difference(stat, args['value'])
        for d in data:
            d['changePercent'] = (d['change'] / (d[stat] - d['change'])) * 100 if (d[stat] - d['change']) > 0 else 0
        return jsonify({
            'data': data
        })


    @api.route("/snapshot")
    def snapshot():
        if not (request.args and 'date' in request.args):
            abort(400, 'Missing request arguments.')

        date_val = request.args['date']
        date_val = format_date_string(date_val)
        try:
            data = controller.snapshot(date_val)
        except KeyError as ex:
            abort(422, "Date out of range.")
        return jsonify({
            'data': data
        })


    @api.route("/timeline")
    def timeline():
        args = request.args
        if not args or not 'value' in args:
            abort(400, "Missing request arguments")

        if "start_date" in args:
            start_date = parse_date(args["start_date"])
            if start_date < FIRST_DATE:
                abort(422, "Date out of range.")
        else:
            start_date = FIRST_DATE

        if "end_date" in args:
            end_date = parse_date(args["end_date"])
        else:
            end_date = datetime.today()

        data = controller.timeline(
            args['value'],
            start_date=start_date,
            end_date=end_date
        )
        return jsonify({
            'data': data
        })

    return api

country_api = create_api("country", country_controller)
state_api = create_api("state", state_controller)
city_api = create_api("city", city_controller)
