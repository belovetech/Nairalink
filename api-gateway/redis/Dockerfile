FROM alpine:3.14

RUN apk update && \
    apk add --no-cache --upgrade redis

CMD ["/usr/bin/redis-server", "--protected-mode", "no"]