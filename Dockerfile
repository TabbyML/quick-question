FROM node:16

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY lerna.json ./


COPY packages/quick-question/package.json ./packages/quick-question/
COPY packages/quick-question-indexer/package.json ./packages/quick-question-indexer/

RUN yarn

COPY packages packages

RUN yarn lerna run build
