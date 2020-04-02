#!/bin/bash

SERVER_PATH=/home/ubuntu/watch-corona/server

exec gunicorn -c $SERVER_PATH/gunicorn_config.py --chdir $SERVER_PATH app:app
