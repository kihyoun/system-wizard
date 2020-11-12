#l! /bin/bash
docker-compose up --remove-orphans --build

echo > .docker.env
printf "WIZARD_IP=" > .docker.env
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' wizard_wizard_1 >> .docker.env
