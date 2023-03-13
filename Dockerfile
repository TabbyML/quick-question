FROM node:16

RUN npm config set registry https://registry.npmmirror.com
RUN npm config set sharp_libvips_binary_host https://npmmirror.com/mirrors/sharp-libvips

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
