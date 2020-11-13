#l! /bin/bash
if [ -f ../system/docker-compose.yml ]; then
    docker-compose -f ../system/docker-compose.yml up --remove-orphans --build -d wizard
else
    docker-compose -p system up --remove-orphans --build -d
fi

echo > .docker.env
printf "WIZARD_IP=" > .docker.env
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' system_wizard_1 >> .docker.env
