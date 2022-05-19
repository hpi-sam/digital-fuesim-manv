#!/bin/bash

set -e

# resetting to http connection
rm -f /etc/nginx/conf.d/https.conf
cp -a /etc/nginx/conf.d/http.template /etc/nginx/conf.d/http.conf

# start nginx
nginx

# only *.conf files in /etc/nginx/conf.d are enabled, others have to explicitly included
if ${SSL_ENABLE}; then
    source /ssl.sh
    cp -a /etc/nginx/conf.d/http-redirect.template /etc/nginx/conf.d/http.conf
    cp -a /etc/nginx/conf.d/https.template /etc/nginx/conf.d/https.conf
    source /etc/cron.daily/cron-renew-session-ticket
    # starting cron for session ticket and acme.sh certs renewing to work
    service cron start
fi

# showing nginx errors
nginx -t

# reload nginx
nginx -s reload

npm run start:once
