#l! /bin/bash

if [ -f ../system/.docker.env ]; then
    if [ $WIZARD_ENABLE = true ]; then
        docker-compose -f ../system/docker-compose.yml up --remove-orphans --build -d wizard
    fi
else
    docker-compose -f ../system/docker-compose.yml up --remove-orphans --build -d wizard
fi

