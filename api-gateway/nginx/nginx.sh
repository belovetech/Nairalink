#!/usr/bin/bash

cd ~
wget http://nginx.org/download/nginx-1.18.0.tar.gz
tar -zxvf nginx-1.18.0.tar.gz

apt-get update
apt-get install build-essential
apt-get install libpcre3 \
                    libpcre3-dev \
                    zlib1g \
                    zlib1g-dev \
                    libssl-dev \
                    libxslt1-dev \
                    libxslt1.1

apt-get remove --purge nginx nginx-common

apt-get install mercurial

cd ~
hg clone http://hg.nginx.org/njs
cd njs
./configure
 make

cd ~/nginx-1.18.0
./configure --sbin-path=/usr/bin/nginx \
            --conf-path=/etc/nginx/nginx.conf \
            --error-log-path=/var/log/nginx/error.log \
            --http-log-path=/var/log/nginx/access.log \
            --with-pcre --pid-path=/var/run/nginx.pid \
            --with-http_ssl_module \
            --with-http_auth_request_module \
            --modules-path=/usr/local/nginx/modules \
            --with-http_v2_module \
            --add-module=$HOME/njs/nginx
make && make install
which nginx
nginx