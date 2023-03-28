#!/bin/sh

apt-get update && \
apt-get install build-essential \
                libxml2 \
                libpcre3 \
                libpcre3-dev \
                zlib1g \
                zlib1g-dev \
                libssl1.1 \
                libssl-dev \
                mercurial \
                -y && \
hg clone http://hg.nginx.org/njs && \
cd njs && ./configure && make && cd / && \
tar -xvf ${FILENAME}.${EXTENSION} && rm ${FILENAME}.${EXTENSION} && \
cd ${FILENAME} && \
./configure \
    --sbin-path=/usr/bin/nginx \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --with-pcre \
    --pid-path=/var/run/nginx.pid \
    --with-http_ssl_module \
    --with-http_auth_request_module \
    --modules-path=/usr/local/nginx/modules \
    --with-http_v2_module \
    --add-module=/njs/nginx && \
make && make install && \
cd / && rm -rfv /${FILENAME} && \
apt-get remove build-essential \ 
                libpcre3-dev \
                zlib1g-dev \
                libssl-dev \
                -y && \
apt-get autoremove -y && \
apt-get clean && rm -rf /var/lib/apt/lists/*