# Use official node image as the base image, important to be on debian based for apt-get
FROM node:16-bullseye-slim

# Disable interactive frontend to prevent install dialogues
ARG DEBIAN_FRONTEND=noninteractive

# setting DEFAULT_VARIABLES
ENV SSL_ENABLE=false

# install nginx
RUN apt-get update && apt-get upgrade -y && apt-get install nginx git cron openssl -y

# deleting default nginx conf
RUN rm /etc/nginx/sites-enabled/default && rm /etc/nginx/sites-available/default

# ssl certs and config of acme.sh in /ssl to be in volume to be saved
RUN mkdir -p /ssl/certs

#nginx config file
COPY ./docker/nginx /etc/nginx/conf.d

#copy docker-entrypoint.sh and ssl.sh file into the container
COPY ./docker/docker-entrypoint.sh /docker-entrypoint.sh
COPY ./docker/ssl.sh /ssl.sh

#make scripts executable
RUN chmod +x /docker-entrypoint.sh
RUN chmod +x /ssl.sh

# download acme.sh
RUN git clone https://github.com/acmesh-official/acme.sh.git /acme.sh.git

# install acme.sh
RUN cd /acme.sh.git && ./acme.sh --install --config-home /ssl/acme.sh

# remove acme.sh source code
RUN rm -r /acme.sh.git

# add the source code to app
COPY ./ /usr/local/app/

# set workdir
WORKDIR /usr/local/app

# setup and install all the dependencies
RUN npm run setup

# Generate the build of the application
RUN npm run build:deployment

# set nginx frontend file rights
RUN chown -R www-data:www-data /usr/local/app/frontend/dist/digital-fuesim-manv

# needed for npm run start:once in docker-entrypoint.sh
WORKDIR /usr/local/app/backend

#nginx port
EXPOSE 80:80

CMD [ "/bin/bash", "-c", "/docker-entrypoint.sh" ]
