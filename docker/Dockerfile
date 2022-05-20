# Use official node image as the base image, important to be on debian based for apt-get
FROM node:16-bullseye-slim

# Disable interactive frontend to prevent install dialogues
ARG DEBIAN_FRONTEND=noninteractive

# make node understand we run in production
ENV NODE_ENV=production

# install necessary packages
RUN apt-get update && apt-get upgrade -y && apt-get install nginx ca-certificates --no-install-recommends -y

# add the source code to app
COPY ./ /usr/local/app/

# set workdir
WORKDIR /usr/local/app

# setup and install all the dependencies
RUN npm run setup:ci

# Generate the build of the application
RUN npm run build:deployment

# set shell to bash with extglob enabled to use delete everything except via rm
SHELL ["/bin/bash", "-O" ,"extglob", "-c"]

# delete unnecessary for production in frontend
WORKDIR /usr/local/app/frontend
RUN rm -rf !(dist)
RUN rm -rf .angular

# delete unnecessary for production in shared
WORKDIR /usr/local/app/shared
RUN rm -rf !(dist|node_modules|package.json)

# delete unnecessary for production in backend
WORKDIR /usr/local/app/backend
RUN rm -rf !(dist|node_modules|package.json)

# delete unnecessary for production in root folder
WORKDIR /usr/local/app
RUN rm -rf !(frontend|shared|backend|docker)

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
