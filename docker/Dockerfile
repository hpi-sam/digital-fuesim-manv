# Use official node image as the base image, important to be on debian based for apt-get
FROM node:16-bullseye-slim

# Disable interactive frontend to prevent install dialogues
ARG DEBIAN_FRONTEND=noninteractive

# install nginx
RUN apt-get update && apt-get upgrade -y && apt-get install nginx -y

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

#nginx config file
COPY ./docker/nginx/default-conf /etc/nginx/sites-available/default

#copy docker-entrypoint.sh file into the container
COPY ./docker/docker-entrypoint.sh /docker-entrypoint.sh

#make it executable
RUN chmod +x /docker-entrypoint.sh

#needed for npm run start:once in docker-entrypoint.sh
WORKDIR /usr/local/app/backend

#nginx port
EXPOSE 80:80

CMD [ "/bin/bash", "-c", "/docker-entrypoint.sh" ]
