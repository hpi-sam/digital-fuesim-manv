# Use official node image as the base image
FROM node:16

COPY backend/package.json /usr/local/app/backend/package.json
COPY shared/package.json /usr/local/app/shared/package.json

WORKDIR /usr/local/app/backend

EXPOSE 3200:3200
EXPOSE 3201:3201

CMD ["npm", "run", "start:once"]
