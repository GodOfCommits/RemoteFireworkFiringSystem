#!/usr/bin/env bash

IP_ADRESSES=$(ip a | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -Ev '^(127|255|0)\.' | tr '\n' ' ')
PORT=8045

echo
echo "Access the application at one of the following addresses:"
echo
for ip in $IP_ADRESSES; do
    echo "http://$ip:$PORT"
done
echo

bash stopper.sh
sudo docker compose up --build
