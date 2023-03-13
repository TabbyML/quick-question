FROM node:16

WORKDIR /usr/src/app/indexer

COPY indexer/package.json ./
COPY indexer/yarn.lock ./

RUN yarn --prod

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn --prod

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]
