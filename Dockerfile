FROM node:16 AS node

WORKDIR /usr/src/www
COPY package*.json ./
RUN npm install --production

COPY ./client/dist ./client/dist
COPY ./config ./config
COPY ./compiled_server ./server

EXPOSE 8123

CMD ["node", "./server/index.js"]
