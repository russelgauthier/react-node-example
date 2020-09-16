#!/bin/sh
docker-compose down;
docker container rm $( docker container ls -aq );
docker container rm $( docker container ls -aq );
docker volume rm $( docker volume ls -q );
docker volume rm $( docker volume ls -q );
docker image rm $( docker image ls -aq );
docker image rm $( docker image ls -aq );
if [[ $# -gt 0 ]] ; then
    docker-compose build;
    docker-compose up;
fi

