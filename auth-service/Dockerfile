# stage one
FROM node:gallium-alpine3.17 AS base

# install dependencies for node-gyp
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY ./package.json .
RUN npm install

# stage two
FROM node:gallium-alpine3.17

EXPOSE 5000

ENV NODE_ENV=development

RUN mkdir -p /home/node/
RUN chown -R node:node /home/node
USER node
WORKDIR /home/node/app

COPY . .
COPY --from=base /app/node_modules  /home/node/app/node_modules

CMD [ "npm", "run", "start" ]
