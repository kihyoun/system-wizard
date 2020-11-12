#l! /bin/bash
docker-compose -p system  up --remove-orphans --build wizard

echo > .docker.env
printf "WIZARD_IP=" > .docker.env
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' system_wizard_1 >> .docker.env
