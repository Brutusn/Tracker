FROM node:16 AS node

WORKDIR /usr/src/www
COPY package*.json ./
RUN npm install --production

COPY ./cert/*.crt ./cert/
COPY ./cert/*.key ./cert/

COPY ./client/dist ./client/dist

COPY ./config ./config

COPY ./server ./server

EXPOSE 8123
EXPOSE 8124

CMD ["node", "./server/index.js"]
