# Use official node image as the base image, important to be on debian based for apt-get
FROM node:16-bullseye-slim


# Disable interactive frontend to prevent install dialogues
ARG DEBIAN_FRONTEND=noninteractive
ARG PRODUCTION_PATH="/usr/local/app"


# install necessary packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends \
    nginx \
    ca-certificates -y && \
    rm -rf /var/lib/apt/lists/*


# add the source code to app
COPY ./ /tmp/dfm

# set workdir
WORKDIR /tmp/dfm

# install for production and cleanup
RUN npm run deployment


    # copy necessary for production in frontend,
RUN cp -a frontend/dist ${PRODUCTION_PATH} && \
    # shared,
    cp -a shared/{dist,node_modules} ${PRODUCTION_PATH} && \
    # in backend,
    cp -a backend/{dist,node_modules,package.json} ${PRODUCTION_PATH}


    # set nginx frontend file rights
RUN chown -R www-data:www-data /usr/local/app/frontend/dist/digital-fuesim-manv && \
    # move docker-entrypoint.sh
    mv ./docker/docker-entrypoint.sh /docker-entrypoint.sh && \
    # and make it executable
    chmod +x /docker-entrypoint.sh && \
    # move nginx config file
    mv ./docker/nginx/default-conf /etc/nginx/sites-available/default


# CLEANUP

# TODO dont even install cypress into the container (right now under /root/.cache/Cypress)

    # delete cache
RUN rm -rf /root/.cache && \
    rm -rf /tmp/dfm


#set correct working directory for docker-entrypoint.sh
WORKDIR /usr/local/app/backend

#nginx port
EXPOSE 80:80

CMD [ "/bin/bash", "-c", "/docker-entrypoint.sh" ]
