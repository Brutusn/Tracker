FROM node:lts-alpine AS node

WORKDIR /usr/src/www
COPY package*.json ./
RUN npm install --production

COPY ./client/dist ./client/dist
COPY ./config ./config
COPY ./compiled_server/src ./server

EXPOSE 8111

CMD ["node", "./server/index.js"]
