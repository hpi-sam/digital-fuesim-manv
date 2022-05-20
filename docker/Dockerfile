# Use official node image as the base image, important to be on debian based for apt-get
FROM node:16-bullseye-slim

# Disable interactive frontend to prevent install dialogues
ARG DEBIAN_FRONTEND=noninteractive

# install necessary packages
RUN apt-get update && apt-get upgrade -y && apt-get install nginx ca-certificates --no-install-recommends -y

# add the source code to app
COPY ./ /usr/local/app/

# set workdir
WORKDIR /usr/local/app

# setup and install all the dependencies
RUN npm run setup:deployment

# Generate the build of the application
RUN npm run build:deployment

# enable reverse delete (remove everything except ...)
RUN shopt -s extglob

# delete unnecessary for production in frontend
RUN cd frontend
RUN rm -rf !(dist)
RUN rm -rf .*
RUN cd ..

# delete unnecessary for production in shared
RUN cd shared
RUN rm -rf !(dist|node_modules)
RUN rm -rf .*
RUN cd ..

# delete unnecessary for production in backend
RUN cd backend
RUN rm -rf !(dist|node_modules|package.json)
RUN rm -rf .*
RUN cd ..

# delete unnecessary for production in root folder
RUN rm -rf !(frontend|shared|backend|docker)
RUN rm -rf .*

# disable reverse delete (remove everything except ...)
RUN shopt -u extglob

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
