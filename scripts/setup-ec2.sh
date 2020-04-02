#!/bin/bash

sudo apt-get upgrade
sudo apt-get update -y

sudo apt-get install python3-pip python3-dev nginx supervisor -y

sudo pip3 install virtualenv

git clone https://github.com/rz1993/watch-corona.git

cd watch-corona

virtualenv env_corona_app
source env_corona_app/bin/activate

cd server
pip3 install -r requirements.txt
