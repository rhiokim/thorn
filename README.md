### Diagram

```
nginx-naxsi (port:80)
  \_ /etc/nginx/nginx.conf --- proxy_pass to wordpress --- wordpress(port: 8080) + mariadb
  \_ /var/log/error.log
  \_ naxsi_core.rule
  \_ nxapi/nxapi.json (configure elastic search)
```

### TODO

### Wordpress + MariaDB

```bash
$ docker run -e MYSQL_ROOT_PASSWORD=wordpress -e MYSQL_DATABASE=wordpress --name wordpressdb -v "$PWD/db":/var/lib/mysql -d mariadb:latest

$ docker run -e WORDPRESS_DB_PASSWORD=wordpress --name wordpress --link wordpressdb:mysql -p 8080:80 -v "$PWD/html":/var/www/html -d wordpress
```

- https://www.upcloud.com/support/wordpress-with-docker/
- https://docs.docker.com/compose/wordpress/

### Elastic Search

```bash
$ docker pull elasticsearch
$ docker run -dit --name elasticsearch -p 9200:9200 -p 9300:9300 elasticsearch

$ curl -X GET http://localhost:9200

$ curl -X PUT http://localhost:9200/nxapi
```

#### Troublshooting with newest elastic docker image
If you get the memory issue of elastic search container inside vm please see this QA
- http://stackoverflow.com/questions/34619215/docker-toolbox-cannot-allocate-memory

`max virtual memory areas vm.max_map_count [65530] is too low`
- https://github.com/spujadas/elk-docker/issues/92

```bash
$ sysctl -w vm.max_map_count=262144
```

### Test Machine

```
export DOCKER_HOST=10.40.219.150:2376
```

### References
- https://github.com/colstrom/docker-nginx-naxsi
- http://stackoverflow.com/questions/40078424/how-could-i-run-nginx-naxsi-in-baseimage
- http://qiita.com/jey0taka/items/ee170239b242fc77887a
