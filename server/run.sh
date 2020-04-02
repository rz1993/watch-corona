#!/bin/bash

SERVER_PATH=/home/rz1993/watch-corona/server

exec $SERVER_PATH/env_covid_app/bin/gunicorn -c $SERVER_PATH/gunicorn_config.py --chdir $SERVER_PATH app:app
