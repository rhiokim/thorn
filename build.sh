#!/bin/bash

containerName="nginx-naxsi"

cd nginx-naxsi

docker build -t nginx-naxsi .

# cleanup potential existing containers
if [ -n "$(docker ps --filter="name=${containerName}" -aq)" ]; then
    docker rm -f ${containerName}
fi

docker run -dit --name ${containerName} --net=host -p 80:80 nginx-naxsi

# wordpress
docker run -e MYSQL_ROOT_PASSWORD=wordpress -e MYSQL_DATABASE=wordpress --name wordpressdb -v "$PWD/db":/var/lib/mysql -d mariadb:latest

docker run -e WORDPRESS_DB_PASSWORD=wordpress --name wordpress --link wordpressdb:mysql -p 8080:80 -v "$PWD/html":/var/www/html -d wordpress
