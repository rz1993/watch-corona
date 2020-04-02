#!/bin/sh

pushd ./data/COVID-19
git pull origin master

popd
flask database update ./data
