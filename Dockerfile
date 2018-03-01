FROM node:9.6.1-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package.json /usr/src/app
RUN npm install

COPY src/ /usr/src/app/src/

EXPOSE 80

CMD npm run serve
