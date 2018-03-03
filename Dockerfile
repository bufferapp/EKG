FROM node:9.6.1-alpine as builder
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
RUN npm run build
RUN npm install -g pkg
RUN /usr/local/bin/pkg -t node8-alpine-x64 app.min.js -o binary

FROM alpine:latest
RUN apk update && apk add --no-cache libstdc++ libgcc
WORKDIR /root/
COPY --from=builder /usr/src/app/binary binary
CMD ["./binary"]
