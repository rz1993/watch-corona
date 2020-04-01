from datetime import datetime, timedelta
from flask import current_app
from pathlib import Path
from sqlalchemy.sql.expression import bindparam, insert
from sqlalchemy.sql import func, select
from sqlalchemy import create_engine, MetaData, Table

import glob
import numpy as np
import os
import pandas as pd


"""
Job description
- Redo update script to read from daily reports folder instead
- Create a "by city" table for US cities
- Create a "by state_province" table for US states
- Create a "by country" table for countries
- Create a table of lat-longs

- If a file is updated, then edit the rows with that date
- If a file is added, then add a new row
- Starting 3/23, there are now state and city level data for the US
- Implement Postgres, lat, long based search API
- Add a last updated column
"""

def get_files(parent_dir):
    dir = Path(parent_dir) / f"COVID-19/csse_covid_19_data/csse_covid_19_daily_reports"
    os.chdir(dir)
    for file in glob.glob("*.csv"):
        yield file

def get_date_columns(df, start_date=None):
    dates = []
    for col in df.columns:
        try:
            date_obj = datetime.strptime(col, "%m/%d/%y").date()
        except:
            continue
        if not start_date or date_obj > start_date:
            dates.append(col)
    return dates

def standardize_date(d):
    return d.strftime("%Y-%m-%d")

def parse_date(d):
    try:
        return datetime.fromisoformat(d)
    except:
        pass

    try:
        return datetime.strptime(d, "%m/%d/%y %H:%M")
    except:
        pass

    try:
        return datetime.strptime(d, "%m/%d/%Y %H:%M")
    except:
        pass

    raise Exception(f"Could not parse datetime {d}")

def format_schema_type_one(df, date):
    # Province/State, Country/Region, Last Update, Confirmed, Deaths, Recovered, latitude, Longitude
    # Group by Country/Region and Province/State
    df = df.dropna(subset=['Confirmed', 'Deaths', 'Recovered'])
    df['Active'] = df['Confirmed'] - (df['Deaths'] + df['Recovered'])
    df['Last Update'] = df['Last Update'].apply(parse_date)
    df_states = df.dropna(subset=['Province/State'])
    df_countries = df.groupby("Country/Region")\
        .agg({
            'Confirmed': 'sum',
            'Deaths': 'sum',
            'Recovered': 'sum',
            'Active': 'sum',
            'Last Update': 'max'
        })\
        .reset_index()

    params_country = []
    for i, row in df_countries.iterrows():
        row = row.to_dict()
        params_country.append({
            'country_region': row['Country/Region'],
            'date': standardize_date(date),
            'confirmed': row['Confirmed'],
            'deaths': row['Deaths'],
            'recovered': row['Recovered'],
            'active': row['Active'],
            'last_updated': row['Last Update']
        })

    params_state = []
    for i, row in df_states.iterrows():
        row = row.to_dict()
        params_state.append({
            'country_region': row['Country/Region'],
            'province_state': row['Province/State'],
            'date': standardize_date(date),
            'confirmed': row['Confirmed'],
            'deaths': row['Deaths'],
            'recovered': row['Recovered'],
            'active': row['Active'],
            'last_updated': row['Last Update']
        })

    return params_country, params_state

def format_schema_type_two(df, date):
    # FIPS, Admin2, Province_State, Country_Region, Last_Update, Lat, Long_, Confirmed, Deaths, Recovered, Active, Combined_Key
    df = df.dropna(subset=['Confirmed', 'Deaths', 'Recovered', 'Active'])
    df['Last_Update'] = df['Last_Update'].apply(parse_date)
    df_cities = df.dropna(subset=['Admin2'])
    df_states = df.dropna(subset=['Province_State'])\
        .groupby('Province_State')\
        .agg({
            'Country_Region': 'first',
            'Confirmed': 'sum',
            'Deaths': 'sum',
            'Recovered': 'sum',
            'Active': 'sum',
            'Last_Update': 'max',
        })\
        .reset_index()
    df_countries = df.groupby("Country_Region")\
        .agg({
            'Confirmed': 'sum',
            'Deaths': 'sum',
            'Recovered': 'sum',
            'Active': 'sum',
            'Last_Update': 'max',
        })\
        .reset_index()

    params_city = []
    for i, row in df_cities.iterrows():
        row = row.to_dict()
        params_city.append({
            'city_only': row['Admin2'],
            'country_region': row['Country_Region'],
            'province_state': row['Province_State'],
            'date': standardize_date(date),
            'confirmed': row['Confirmed'],
            'deaths': row['Deaths'],
            'recovered': row['Recovered'],
            'active': row['Active'],
            'last_updated': row['Last_Update'],
            'city': row['Combined_Key']
        })

    params_state = []
    for i, row in df_states.iterrows():
        row = row.to_dict()
        params_state.append({
            'country_region': row['Country_Region'],
            'province_state': row['Province_State'],
            'date': standardize_date(date),
            'confirmed': row['Confirmed'],
            'deaths': row['Deaths'],
            'recovered': row['Recovered'],
            'active': row['Active'],
            'last_updated': row['Last_Update']
        })

    params_country = []
    for i, row in df_countries.iterrows():
        row = row.to_dict()
        params_country.append({
            'country_region': row['Country_Region'],
            'date': standardize_date(date),
            'confirmed': row['Confirmed'],
            'deaths': row['Deaths'],
            'recovered': row['Recovered'],
            'active': row['Active'],
            'last_updated': row['Last_Update']
        })
    return params_country, params_state, params_city

def upsert(conn, table, params, date, constraint_columns, value_columns):
    columns = [getattr(table.c, c) for c in constraint_columns]

    # Find all existing rows for a certain date
    query = (
        select([table.c.id] + columns)\
        .where(table.c.date == date)\
    )
    rows = conn.execute(query).fetchall()
    print(f"Found {len(rows)} existing rows for {date}. Will attempt to update these.")

    # For each row map its unique name (country, state, city etc.) to its primary key id
    id_by_constraints = {}
    for row in map(dict, rows):
        key = [row[k] for k in constraint_columns]
        id_by_constraints[tuple(key)] = row['id']

    # For each row to be upserted, determine if it already exists in the database for this date
    # If it does exist then append it to the rows to be updated
    # If it doesn't then append it to the new rows to be inserted
    upsert_rows = []
    insert_rows = []
    for param in params:
        key = tuple([param[k] for k in constraint_columns])
        if key in id_by_constraints:
            update_param = {'row_id': id_by_constraints[key]}
            for c in value_columns:
                update_param[c] = param[c]
            upsert_rows.append(update_param)
        else:
            insert_rows.append(param)

    # Perform a bulk update by using a parameterized SQl query
    stmt = (
        table.update().
        where(table.c.id == bindparam('row_id')).
        values(**{col: bindparam(col) for col in value_columns})
    )

    # Execute update
    if len(upsert_rows):
        print(f"Updating {len(upsert_rows)} rows.")
        conn.execute(stmt, upsert_rows)
    # Execute insert
    if len(insert_rows):
        print(f"Inserting {len(insert_rows)} rows.")
        conn.execute(table.insert(), insert_rows)

def update(data_dir, start_date=None, end_date=None):
    conn_string = current_app.config['DATABASE_URI']

    engine = create_engine(conn_string)
    meta = MetaData()

    table_country = Table("stats_country", meta, autoload=True, autoload_with=engine)
    table_state = Table("stats_state", meta, autoload=True, autoload_with=engine)
    table_city = Table("stats_city", meta, autoload=True, autoload_with=engine)
    conn = engine.connect()

    for file in get_files(data_dir):
        df = pd.read_csv(file)
        date = datetime.strptime(file.strip(".csv"), "%m-%d-%Y")
        if (start_date and date < start_date) or (end_date and date > end_date):
            continue

        if 'FIPS' in df.columns:
            params_country, params_state, params_city = format_schema_type_two(df, date)
        else:
            params_country, params_state = format_schema_type_one(df, date)
            params_city = None

        upsert(conn, table_country, params_country, date, ['country_region'], ['last_updated', 'confirmed', 'deaths', 'recovered', 'active'])
        upsert(conn, table_state, params_state, date, ['province_state'], ['last_updated', 'confirmed', 'deaths', 'recovered', 'active'])

        if params_city:
            upsert(conn, table_city, params_city, date, ['city'], ['last_updated', 'confirmed', 'deaths', 'recovered', 'active'])
