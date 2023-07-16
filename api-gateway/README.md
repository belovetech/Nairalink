# Nginx - Api Gateway

Nginx, as an API gateway, acts as a centralized entry point, routing and managing incoming requests, enforcing security, and providing load balancing and caching for Nairalink services.

### How to use

1. run `chmod +x nginx.sh` to change the mode of nginx.sh to executable file.
2. run `./nginx.sh` to install nginx
3. move nginx.conf and oauth2.js files into /etc/nginx
4. run `sudo nginx -t` to check if test successful
5. `sudo service nginx restart` or `sudo systemctl restart nginx`

Alternatively, you can use the Dockerfile.
