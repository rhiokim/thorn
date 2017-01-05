init:
	export WAF_HOST="10.40.219.150"
	export DOCKER_HOST="$WAF_HOST:2376"

create-machine:
	docker-machine create -d virtualbox naxsi-test-env
	docker-machine ssh naxsi-test-env "mkdir db && mkdir html"

build: build-naxsi build-web

build-naxsi:
	docker build -t nginx-naxsi -f ./nginx-naxsi/Dockerfile ./nginx-naxsi

build-web:
	docker build -t webserver -f ./webserver/Dockerfile ./webserver

build-zmq:
	docker build -t thorn-zmq -f ./zeromq/Dockerfile ./zeromq

run-naxsi:
	docker run -dit --name nginx-naxsi -p 81:80 nginx-naxsi

run-zmq:
	docker run -dit --name thorn-zmq -e ZMQ_MODE=pub -e ZMQ_PORT=5556 -e ZMQ_HOST=172.17.0.2 thorn-zmq

stop-naxsi:
	docker rm -f nginx-naxsi

stop-zmq:
	docker rm -f thorn-zmq

restart-naxsi: stop-naxsi run-naxsi

restart-zmq: stop-zmq run-zmq

all-naxsi: build-naxsi restart-naxsi

all-zmq: build-zmq restart-zmq

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
