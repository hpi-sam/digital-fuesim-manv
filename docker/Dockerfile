# set path
ARG PRODUCTION_PATH="/usr/local/app"

# Use official node image as the base image
FROM node:16-bullseye-slim AS builder

# needed to use PRODUCTION_PATH before the first FROM
ARG PRODUCTION_PATH

# add the source code to app
COPY ./ $PRODUCTION_PATH

# set workdir
WORKDIR $PRODUCTION_PATH

# install for production and cleanup
RUN npm run deployment

####  building done  ####
#########################
####  prod container ####
# Use official node image as the base image, important to be on debian based for apt-get
FROM node:16-bullseye-slim

# needed to use PRODUCTION_PATH before the first FROM
ARG PRODUCTION_PATH

# Disable interactive frontend to prevent install dialogues
ARG DEBIAN_FRONTEND=noninteractive
# set production patch

WORKDIR $PRODUCTION_PATH

# install necessary packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends \
    nginx \
    ca-certificates -y && \
    rm -rf /var/lib/apt/lists/*

# copy frontend
COPY --chown=www-data:www-data --from=builder $PRODUCTION_PATH/frontend/dist $PRODUCTION_PATH/frontend/dist

# copy shared
COPY --chown=www-data:www-data --from=builder $PRODUCTION_PATH/shared/dist $PRODUCTION_PATH/shared/dist
COPY --chown=www-data:www-data --from=builder $PRODUCTION_PATH/shared/node_modules $PRODUCTION_PATH/shared/node_modules
COPY --chown=www-data:www-data --from=builder $PRODUCTION_PATH/shared/package.json $PRODUCTION_PATH/shared

# copy backend
COPY --chown=www-data:www-data --from=builder $PRODUCTION_PATH/backend/dist $PRODUCTION_PATH/backend/dist
COPY --chown=www-data:www-data --from=builder $PRODUCTION_PATH/backend/node_modules $PRODUCTION_PATH/backend/node_modules
COPY --chown=www-data:www-data --from=builder $PRODUCTION_PATH/backend/package.json $PRODUCTION_PATH/backend

# copy nginx config file
COPY --chown=www-data:www-data --from=builder $PRODUCTION_PATH/docker/nginx/default-conf /etc/nginx/sites-available/default

# copy docker-entrypoint.sh
COPY --chown=www-data:www-data --from=builder $PRODUCTION_PATH/docker/docker-entrypoint.sh /docker-entrypoint.sh

# and make it executable
RUN chmod +x /docker-entrypoint.sh

# set correct working directory for docker-entrypoint.sh
WORKDIR $PRODUCTION_PATH/backend

# nginx port
EXPOSE 80:80

CMD [ "/bin/bash", "-c", "/docker-entrypoint.sh" ]
