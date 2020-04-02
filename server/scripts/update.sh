#!/bin/sh

pushd ./data/COVID-19
git pull origin master
popd

APP_SERVER_PATH=/home/rz1993/watch-corona/server

$APP_SERVER_PATH/env_covid_app/bin/flask database update $APP_SERVER_PATH/data
