# Use official node image as the base image, important to be on debian based for apt-get
FROM node:16-bullseye-slim

# Disable interactive frontend to prevent install dialogues
ARG DEBIAN_FRONTEND=noninteractive

# make node understand we run in production
ENV NODE_ENV=production

# install necessary packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends \
    nginx \
    ca-certificates -y && \
    rm -rf /var/lib/apt/lists/*

# add the source code to app
COPY ./ /usr/local/app/

# set workdir
WORKDIR /usr/local/app

    # setup all the dependencies
RUN npm run setup:ci && \
    # generate build of the application
    npm run build:deployment && \
    # and cleanup afterwards
    npm cache clean --force

# set shell to bash with extglob enabled to use delete everything except via rm
SHELL ["/bin/bash", "-O" ,"extglob", "-c"]

    # delete unnecessary for production in frontend,
RUN rm -rf frontend/!(dist) && \
    rm -rf frontend/.angular && \
    # in shared,
    rm -rf shared/!(dist|node_modules|package.json) && \
    # in backend,
    rm -rf backend/!(dist|node_modules|package.json) && \
    # in root
    rm -rf !(frontend|shared|backend|docker) && \
    # and delete cache
    rm -rf /root/.cache && \
    # set nginx frontend file rights
    chown -R www-data:www-data /usr/local/app/frontend/dist/digital-fuesim-manv && \
    # move docker-entrypoint.sh
    mv ./docker/docker-entrypoint.sh /docker-entrypoint.sh && \
    # and make it executable
    chmod +x /docker-entrypoint.sh && \
    # move nginx config file
    mv ./docker/nginx/default-conf /etc/nginx/sites-available/default

# TODO dont even install cypress into the container (right now under /root/.cache/Cypress)

#needed for npm run start:once in docker-entrypoint.sh
WORKDIR /usr/local/app/backend

#nginx port
EXPOSE 80:80

CMD [ "/bin/bash", "-c", "/docker-entrypoint.sh" ]
