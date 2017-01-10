FROM mhart/alpine-node:7

MAINTAINER Rhio Kim "rhio.kim@gmail.com"

RUN apk add --no-cache make gcc g++ python

#copy package first to cache npm-install and speed up build
RUN mkdir -p server
WORKDIR server

COPY index.js index.js
# COPY stream.js index.js
COPY config.json config.json
COPY package.json package.json
COPY libs libs

RUN npm --quiet --no-color install
RUN npm cache clear

EXPOSE 5556

CMD ["npm", "start"]
