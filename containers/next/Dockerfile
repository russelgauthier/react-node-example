FROM node:14.9.0-alpine AS builder

ARG root_dir=/usr/src/app
RUN apk add --update tini \
	&& mkdir -p $root_dir

#Copying over current base application
WORKDIR $root_dir
COPY package.json .

#Installing base dependencies & cleaning up
RUN apk upgrade --update \
    && yarn install \
    && yarn install --dev \
    && yarn cache clean

#Copying over all files
COPY . .

#Building
RUN yarn build && yarn --production

#Multistage
FROM node:14.9.0-alpine
COPY --from=builder $root_dir/node_modules ./node_modules
COPY --from=builder $root_dir/.next ./.next
COPY --from=builder $root_dir/next.config.js ./next.config.js

#Setting main ports
ENV PORT 3000
EXPOSE 3000

#Setting main thread
CMD ["node_modules/.bin/next", "start"]
