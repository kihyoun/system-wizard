#l! /bin/bash
if [ -f ../system/docker-compose.yml ] && [ -f ../system/.docker.env ]; then
    docker-compose -f ../system/docker-compose.yml up --remove-orphans --build -d wizard
    echo > .docker.env
    printf "WIZARD_IP=" > .docker.env
    docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' system_wizard_1 >> .docker.env
else
    echo "wizard [start] skipped (no main conf)"
fi

