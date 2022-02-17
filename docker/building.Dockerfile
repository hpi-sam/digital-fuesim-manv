# Use official node image as the base image
FROM node:16

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# setup and install all the dependencies
RUN npm run setup

# Generate the build of the application
RUN npm run build:deployment
