# ![](assets/thorn-of-crown.jpg)

## Diagram

```
nginx-naxsi (port:80)
  \_ /etc/nginx/nginx.conf --- proxy_pass to wordpress --- wordpress(port: 8080) + mariadb
  \_ /var/log/error.log
  \_ naxsi_core.rule
  \_ nxapi/nxapi.json (configure elastic search)
```

## How to run

### Test Machine

Please skip this step, if you do not run naxsi with nginx on your host OS

```
$ export DOCKER_HOST=10.40.219.150:2376 // test01
```

### with VM

Please skip this step too, if you do not run naxsi with nginx on your Virtual OS

```bash
$ make create-machine
$ docker-machine ip naxsi-test-env
NAME             ACTIVE   DRIVER       STATE     URL                         SWARM   DOCKER    ERRORS
naxsi-test-env   -        virtualbox   Running   tcp://192.168.99.100:2376           v1.12.4

$ export DOCKER_HOST=192.168.99.100:2376 // vm
```

### Wordpress + MariaDB

```bash
$ docker run -e MYSQL_ROOT_PASSWORD=wordpress -e MYSQL_DATABASE=wordpress --name wordpressdb -v "$PWD/db":/var/lib/mysql -d mariadb:latest

$ docker run -e WORDPRESS_DB_PASSWORD=wordpress --name wordpress --link wordpressdb:mysql -p 8080:80 -v "$PWD/html":/var/www/html -d wordpress

//or

$ make run-blog
```

- https://www.upcloud.com/support/wordpress-with-docker/
- https://docs.docker.com/compose/wordpress/

### NginX + Naxsi

```bash
$ make build
$ make run-naxsi
```

#### Naxsi Test

```bash
$ curl "http://10.40.219.150/?a=<"
```

### Elastic Search

```bash
$ docker pull elasticsearch
$ docker run -dit --name elasticsearch -p 9200:9200 -p 9300:9300 elasticsearch

// or

$ make run-elastic

// create elastic search index and test call
$ curl -X GET http://localhost:9200
$ curl -X PUT http://localhost:9200/nxapi
```

#### Import Nginx log to Elastic Search

```bash
$ ./nxtool.py -c nxapi.json --files=/var/log/nginx/localhost_error80.log
```

#### Get log data from Elastic Search

```bash
$ curl -X POST "http://10.40.219.150:9200/nxapi/events/_search?pretty" -d {}
```

#### To generate whitelists for DOMAIN
I want to generate whitelists for 10.40.219.150, so I will get more precise statistics first

```bash
$ ./nxtool.py -c nxapi.json -s 10.40.219.150 -f
$ ./nxtool.py -c nxapi.json -f --slack --colors | grep BasicRule
$ ./nxtool.py -c nxapi.json -f --slack --colors | grep BasicRule > /etc/nginx/custom.rules
```

- see more: https://github.com/nbs-system/naxsi/tree/master/nxapi#2-generate-whitelists

#### To Troublshoot with newest Elastic Search docker image on VM
If you get the memory issue of elastic search container inside vm please see this QA
- http://stackoverflow.com/questions/34619215/docker-toolbox-cannot-allocate-memory

max virtual memory areas vm.max_map_count [65530] is too low
- https://github.com/spujadas/elk-docker/issues/92

```bash
$ sysctl -w vm.max_map_count=262144
```

If `fielddata` issue is happen with newest Elastic Search, when nxtool generate whitelist.

You should patch it as follow
```
PUT ~/nxapi/_mapping/events
{
  "properties": {
    "id": {
        "type": "text",
        "fielddata": true,
        "fields": {
            "keyword": {
                "type": "keyword",
                "ignore_above": 256
            }
        }
    }
  }
}
```
- https://www.elastic.co/guide/en/elasticsearch/reference/5.0/fielddata.html

## TODO


### References
- https://github.com/colstrom/docker-nginx-naxsi
- http://stackoverflow.com/questions/40078424/how-could-i-run-nginx-naxsi-in-baseimage
- http://qiita.com/jey0taka/items/ee170239b242fc77887a
- https://github.com/nbs-system/naxsi/tree/master/nxapi
