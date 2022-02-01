# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:16 as build

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# setup and install all the dependencies
RUN npm run setup

# Install all the dependencies
#RUN npm install

# Generate the build of the application
RUN npm run build


RUN cd backend

RUN ls -l

RUN npm run start:once

EXPOSE 4200
EXPOSE 3201
EXPOSE 3200

# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/frontend/dist/digital-fuesim-manv /usr/share/nginx/html

# Expose ports
EXPOSE 80
#EXPOSE 4200
#EXPOSE 3201
#EXPOSE 3200
