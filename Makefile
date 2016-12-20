init:
	export WAF_HOST="10.40.219.150"
	export DOCKER_HOST="$WAF_HOST:2376"

create-machine:
	docker-machine create -d virtualbox naxsi-test-env
	docker-machine ssh naxsi-test-env "mkdir db && mkdir html"

build:
	docker build -t nginx-naxsi -f ./nginx-naxsi/Dockerfile ./nginx-naxsi

run-naxsi:
	docker run -dit --name nginx-naxsi -p 80:80 nginx-naxsi

stop-naxsi:
	docker rm -f nginx-naxsi

restart-naxsi: stop-naxsi run-naxsi

run-wordpress:
	docker run -e WORDPRESS_DB_PASSWORD=wordpress --name wordpress --link wordpressdb:mysql -p 8101:80 -d wordpress

stop-wordpress:
	docker rm -f wordpress

run-mariadb:
	docker run -e MYSQL_ROOT_PASSWORD=wordpress -e MYSQL_DATABASE=wordpress --name wordpressdb -d mariadb:latest

stop-mariadb:
	docker rm -f wordpressdb

run-elastic:
	docker run -dit --name elasticsearch -p 9200:9200 -p 9300:9300 elasticsearch
	curl -X GET http://10.40.219.150:9200
	curl -X PUT http://10.40.219.150:9200/nxapi

stop-elastic:
	docker rm -f elasticsearch

run-blog: run-mariadb run-wordpress

stop-all: stop-elastic stop-naxsi stop-mariadb stop-wordpress

start-all: run-elastic run-mariadb run-wordpress run-naxsi

test-naxsi:
	curl "http://10.40.219.150/?a=<"

get-naxsi:
	curl -X POST "http://10.40.219.150:9200/nxapi/events/_search?pretty" -d {}
