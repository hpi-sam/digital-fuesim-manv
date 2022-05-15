#!/bin/bash

# only *.conf files in /etc/nginx/conf.d are enabled, others have to explicitly included
if [[ ${SSL_ENABLE} ]]; then
    source ssl.sh
    cp -a /etc/nginx/conf.d/http-redirect.template /etc/nginx/conf.d/http.conf
    cp -a /etc/nginx/conf.d/https.template /etc/nginx/conf.d/https.conf
    # starting cron for session ticket and acme.sh certs renewing to work
    service cron start
else
    # deleting https connection
    rm /etc/nginx/conf.d/https.conf
    cp -a /etc/nginx/conf.d/http.template /etc/nginx/conf.d/http.conf
fi

nginx &

npm run start:once
