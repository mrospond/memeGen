#!/bin/bash

req_file=./requirements.txt

if [ ! -d ./venv ]; then
    echo "creating venv..."
    sudo apt update -y
    sudo apt install -y python3-venv
    python3 -m venv ./venv
fi

if [ ! -e ./venv/bin/activate ]; then
    sleep 2
fi

source ./venv/bin/activate
export FLASK_APP=app.py
export FLASK_DEBUG=1

if [ -e $req_file ]; then
    echo "installing dependencies..."
    pip3 install -r $req_file > /dev/null
fi

unset req_file

python3 -m flask run
