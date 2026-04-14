FROM node:18-alpine

RUN apk add --no-cache bash

RUN npm install -g \
    typescript \
    ts-node \
    nodemon

WORKDIR /app

CMD ["/bin/bash"]