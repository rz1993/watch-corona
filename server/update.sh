#!/bin/sh

pushd COVID-19
git pull origin master

popd
flask database update ./
