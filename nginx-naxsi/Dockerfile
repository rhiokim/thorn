########################################################
# Nginx + naxsi docker baseimage (ubuntu xenial 16.06) #
########################################################

FROM phusion/baseimage:0.9.19
MAINTAINER Rhio Kim "rhio.kim@gmail.com"

ENV NGINX_VERSION 1.10.2
ENV NAXSI_VERSION master
ENV NGINX_ZMQ master

CMD ["/sbin/my_init"]

RUN apt-get update && \
    apt-get install -y tar git vim nano wget net-tools build-essential \
        python python-dev python-pip python-virtualenv \
        libpcre3-dev libxslt1-dev libgd2-xpm-dev libgeoip-dev libssl-dev libzmq3-dev

RUN cd /tmp/ && \
    wget https://github.com/nbs-system/naxsi/archive/$NAXSI_VERSION.tar.gz && \
    wget https://nginx.org/download/nginx-$NGINX_VERSION.tar.gz && \
    wget -O zmq-$NGINX_ZMQ.tar.gz https://github.com/alticelabs/nginx-log-zmq/archive/$NGINX_ZMQ.tar.gz && \
    tar xf $NAXSI_VERSION.tar.gz && \
    tar xf zmq-$NGINX_ZMQ.tar.gz && \
    tar xf nginx-$NGINX_VERSION.tar.gz

# COPY ngx_zmq_config /tmp/nginx-log-zmq-master/config

RUN cd /tmp/nginx-$NGINX_VERSION && \
    ./configure --conf-path=/etc/nginx/nginx.conf \
        --add-module=../naxsi-$NAXSI_VERSION/naxsi_src \
        --add-dynamic-module=../nginx-log-zmq-master \
        --error-log-path=/var/log/nginx/error.log \
        --http-client-body-temp-path=/var/lib/nginx/body \
        --http-fastcgi-temp-path=/var/lib/nginx/fastcgi \
        --http-log-path=/var/log/nginx/access.log \
        --http-proxy-temp-path=/var/lib/nginx/proxy \
        --lock-path=/var/lock/nginx.lock \
        --pid-path=/var/run/nginx.pid \
        --with-http_ssl_module \
        --without-mail_pop3_module \
        --without-mail_smtp_module \
        --without-mail_imap_module \
        --without-http_uwsgi_module \
        --without-http_scgi_module \
        # --with-debug \
        --with-ld-opt="-lzmq" \
        # --with-ipv6 \
        --prefix=/usr && \
    make && \
    make install && \
    mkdir -p /var/lib/nginx/{body,proxy}
RUN cp -rp /tmp/naxsi-$NAXSI_VERSION/naxsi_config/naxsi_core.rules /etc/nginx/
RUN cp -rp /tmp/naxsi-$NAXSI_VERSION/nxapi /etc/nginx/

RUN rm -rf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY 418.html /usr/html/418.html

# If you want to execute nxtoll as naxsi's rule generator inside this container please uncomments below 4 config
RUN rm -rf /etc/nginx/nxapi/nxapi.json
COPY nxapi.json /etc/nginx/nxapi/nxapi.json
RUN pip install --upgrade pip
RUN cd /etc/nginx/nxapi/ && pip install -r requirements.txt

RUN echo "daemon off;" >> /etc/nginx/nginx.conf && \
    mkdir -p /etc/service/nginx && \
    echo "#!/usr/bin/env bash\n\nnginx" > /etc/service/nginx/run && \
    chmod +x /etc/service/nginx/run

VOLUME /var/log/nginx/

# Cleanup.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 80
