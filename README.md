# ![](assets/thorn-of-crown.jpg)

## Diagram

```
nginx-naxsi (port:81)
  \_ /etc/nginx/nginx.conf --- proxy_pass to wordpress --- wordpress(port: 8080) + mariadb
  \_ /var/log/error.log
  \_ naxsi_core.rule
  \_ nxapi/nxapi.json (configure elastic search)

nginx-zmq-log
  \_ /etc/nginx/nginx.conf --- `log_zmq_server thorn-zmq-sub:5556`

thron-ui (not ready yet)

thorn-zmq-sub (port:5556)

thorn-netfilter (blank: 80, netfilter api: 8082, dummy web server: 9000)
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

#### nginx_zmq_log within newest nginx

Configure: removed the --with-ipv6 option. IPv6 now compiled-in automatically if support is found. If there is a need to disable it for some reason, --with-cc-opt="-DNGX_HAVE_INET6=0" can be used for this.

---

To compile a third-party module that has been converted, use the new --add-dynamic-module argument and specify the path:

# ./configure --add-dynamic-module=/path/to/module/source
As with NGINX modules, a shared object is created and installed in the modules subdirectory, and you add a load_module directive for it to the NGINX configuration. Our developer relations team is available to assist with converting a module. Contact us via the NGINX development mailing list.

- https://www.nginx.com/blog/dynamic-modules-nginx-1-9-11/

---

`ngx_zmq_log` module doesn't work well with nginx. There is no problem, when it's compiled with nginx. But it's not run cause of `dlopen: undefined symbol ngx_zmq_log`

#### nginx_zmq_log dynamic module compile with nginx

```
./configure --conf-path=/etc/nginx/nginx.conf \
    --add-dynamic-module=../nginx-log-zmq-master \
    --with-ld-opt="-lzmq"
```

#### ngx_zmq_log configuration in nginx.conf

```
http {
  log_zmq_server main 172.17.0.4:5556 tcp 4 1000;  # required

  log_zmq_endpoint  main "";  # required

  log_zmq_format main '{"remote_addr":"$remote_addr", "remote_user":"$remote_user",'
                      '"request":"$request", "status":"$status",'
                      '"body_bytes_sent":"$body_bytes_sent",'
                      '"http_referer": "$http_referer", "http_user_agent":"$http_user_agent",'
                      '"http_x_forwarded_for": "$http_x_forwarded_for",'
                      '"time_local":"$time_local"}';  # required
}
```

## TODO


### References
- https://github.com/colstrom/docker-nginx-naxsi
- http://stackoverflow.com/questions/40078424/how-could-i-run-nginx-naxsi-in-baseimage
- http://qiita.com/jey0taka/items/ee170239b242fc77887a
- https://github.com/nbs-system/naxsi/tree/master/nxapi
- https://www.nginx.com/resources/wiki/modules/log_zmq/#log-zmq-installation
- http://bravenewgeek.com/a-look-at-nanomsg-and-scalability-protocols/
