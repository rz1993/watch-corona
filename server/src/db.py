from sqlalchemy import (
    Column,
    MetaData,
    Table,
    create_engine,
    Date,
    DateTime,
    Float,
    Integer,
    String
)
from flask import current_app, g


meta = MetaData()
time_series = Table("covid19_timeseries", meta,
    Column('id', Integer, primary_key=True),
    Column('country_region', String, nullable=False),
    Column('province_state', String),
    Column('lat', Float, nullable=False),
    Column('long', Float, nullable=False),
    Column('date', Date, nullable=False),
    Column('confirmed', Integer, nullable=False),
    Column('deaths', Integer, nullable=False),
    Column('recovered', Integer, nullable=False)
)

table_country = Table("stats_country", meta,
    Column('id', Integer, primary_key=True),
    Column('country_region', String, nullable=False),
    Column('date', Date, nullable=False),
    Column('last_updated', DateTime, nullable=False),
    Column('confirmed', Integer, nullable=False),
    Column('deaths', Integer, nullable=False),
    Column('recovered', Integer, nullable=False),
    Column('active', Integer, nullable=False),
)

table_state = Table("stats_state", meta,
    Column('id', Integer, primary_key=True),
    Column('country_region', String, nullable=False),
    Column('province_state', String),
    Column('date', Date, nullable=False),
    Column('last_updated', DateTime, nullable=False),
    Column('confirmed', Integer, nullable=False),
    Column('deaths', Integer, nullable=False),
    Column('recovered', Integer, nullable=False),
    Column('active', Integer, nullable=False)
)

table_city = Table("stats_city", meta,
    Column('id', Integer, primary_key=True),
    Column('country_region', String, nullable=False),
    Column('province_state', String),
    Column('city_only', String),
    Column('city', String),
    Column('date', Date, nullable=False),
    Column('last_updated', DateTime, nullable=False),
    Column('confirmed', Integer, nullable=False),
    Column('deaths', Integer, nullable=False),
    Column('recovered', Integer, nullable=False),
    Column('active', Integer, nullable=False)
)

metadata = MetaData()
engine = None

def get_connection():
    global engine

    if engine is None:
        db_uri = current_app.config['DATABASE_URI']
        engine = create_engine(db_uri)

    return engine.connect()
