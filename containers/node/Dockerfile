FROM node:14.1.0-alpine AS builder

ARG root_dir=/usr/src/app
RUN apk add --update tini \
	&& mkdir -p $root_dir

#Copying over current base application
WORKDIR $root_dir
COPY package.json .

#Installing base dependencies & cleaning up
RUN apk add --update python make g++ \
    && yarn install \
    && yarn install --dev \
    && yarn global add nodemon \
    && yarn global add mocha \
    && yarn cache clean

#Copying over all files
COPY . .

#Multistage
FROM node:14.1.0-alpine
COPY --from=builder $root_dir/node_modules ./node_modules
COPY --from=builder $root_dir/bin ./bin
COPY --from=builder $root_dir/config ./config
COPY --from=builder $root_dir/libs ./libs
COPY --from=builder $root_dir/middleware ./middleware
COPY --from=builder $root_dir/models ./models
COPY --from=builder $root_dir/public ./public
COPY --from=builder $root_dir/routes ./routes
COPY --from=builder $root_dir/views ./views
COPY --from=builder $root_dir/app.js ./app.js
COPY --from=builder $root_dir/LICENSE ./LICENCE
COPY --from=builder $root_dir/AUTHOR ./AUTHOR

#Setting main ports
ENV PORT 80
EXPOSE 80

#Setting main thread
CMD ["tini", "--", "node", "./bin/www"]

#CMD ["echo", "Node started! 🎉"]