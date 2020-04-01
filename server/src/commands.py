import click
from datetime import datetime, timedelta
from flask import current_app
from flask.cli import AppGroup
from sqlalchemy import (
    create_engine,
    MetaData,
    Table,
    Column,
    DateTime,
    Integer,
    String,
    Date,
    Float
)
from src.db import meta
from src.jobs.update import update


db_cli = AppGroup('database')

@db_cli.command('create')
def create_tables():
    conn_string = current_app.config['DATABASE_URI']
    engine = create_engine(conn_string)

    meta.create_all(engine)

@db_cli.command('drop')
def drop_tables():
    conn_string = current_app.config['DATABASE_URI']
    engine = create_engine(conn_string)

    meta.drop_all(engine)

@db_cli.command('update')
@click.argument('directory')
def update_tables(directory):
    end_date = datetime.today()
    start_date = end_date - timedelta(days=3)
    update(directory, start_date=start_date, end_date=end_date)

@db_cli.command('fill')
@click.argument('directory')
def fill_tables(directory):
    end_date = datetime.today()
    update(directory, start_date=None, end_date=end_date)
