FROM node:23-alpine

RUN npm install -g nodemon pnpm

RUN mkdir /src
WORKDIR /src

# RUN sh -c 'echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && apk update'
# RUN sh -c 'apk update'
# RUN apk add mediainfo graphicsmagick ffmpeg libheif-dev imagemagick

ADD package.json /src/package.json
ADD ../tsconfig.json /src/tsconfig.json

ADD pnpm-lock.yaml /src/pnpm-lock.yaml
RUN pnpm i
# If 'sharp' is needed
# RUN npm install sharp@^0.23.4

CMD npm run dev