FROM mhart/alpine-node:7

MAINTAINER Rhio Kim "rhio.kim@gmail.com"

#copy package first to cache npm-install and speed up build
RUN mkdir -p server
WORKDIR server

COPY index.js index.js
COPY package.json package.json

RUN npm --quiet --no-color install
RUN npm cache clear

EXPOSE 8082

CMD ["npm", "start"]
