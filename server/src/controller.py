from sqlalchemy import MetaData, Table, create_engine, asc, desc
from sqlalchemy.sql import and_, or_, not_, func, literal_column, select, text
from src.db import table_country, get_connection
from flask import g


class DataTable:
    def __init__(self, table, main_key, keys_denorm):
        self.table = table
        self.main_key = main_key
        self.keys_denorm = keys_denorm

    @staticmethod
    def execute(query, as_dict=True, as_scalar=False, **query_kwargs):
        conn = g.dbconn
        results = conn.execute(query, **query_kwargs).fetchall()
        if as_dict:
            results = [dict(r) for r in results]
        elif as_scalar:
            results = [r[0] for r in results]
        return results

    def all_keys(self):
        table = self.table
        conn = g.dbconn

        query = select([getattr(table.c, self.main_key)]).distinct()
        return self.execute(query, as_dict=False, as_scalar=True)

    def newest_date(self):
        table = self.table
        conn = g.dbconn

        query = select([func.max(table.c.date)])
        newest_date = conn.execute(query).fetchone()
        if not newest_date or not newest_date[0]:
            raise Exception

        newest_date = newest_date[0]
        return newest_date

    def newest(self, sort_by=None, ascending=False):
        newest_date = self.newest_date()
        return self.snapshot(
            newest_date,
            sort_by=sort_by,
            ascending=ascending
        )

    def snapshot(self, date, key_values=None, sort_by=None, ascending=False):
        table = self.table
        conn = g.dbconn

        key_columns = [getattr(table.c, c) for c in self.keys_denorm]
        value_columns =  [table.c.last_updated,
                          table.c.date,
                          table.c.confirmed,
                          table.c.deaths,
                          table.c.recovered,
                          table.c.active]

        query = (
            select(key_columns + value_columns)
                .where(table.c.date == date)
        )

        if sort_by:
            sort_column = sort_by#getattr(table.c, sort_by)
            order_clause = asc(sort_column) if ascending else desc(sort_column)
            query = query.order_by(order_clause)

        return self.execute(query, as_dict=True)

    def timeline(self, key_value, start_date=None, end_date=None):
        table = self.table
        conn = g.dbconn

        key_columns = [getattr(table.c, c) for c in self.keys_denorm]
        value_columns = [
            table.c.last_updated,
            table.c.date,
            table.c.confirmed,
            table.c.deaths,
            table.c.recovered,
            table.c.active
        ]

        query = (
            select(key_columns + value_columns)
            .where(getattr(table.c, self.main_key) == key_value)
        )
        if start_date:
            query = query.where(table.c.date >= start_date)
        if end_date:
            query = query.where(table.c.date <= end_date)
        query = query.order_by(asc(table.c.date))

        return self.execute(query)

    def daily_difference(self, stat, key_value):
        conn = g.dbconn
        table = self.table

        query = text(f"""
            SELECT date, {stat}, {stat} - LAG({stat}) OVER (ORDER BY date ASC) as change
                FROM {table.name}
                WHERE {self.main_key} = :key_value
                OFFSET 1;
        """)

        return self.execute(query, as_dict=True, key_value=key_value)
