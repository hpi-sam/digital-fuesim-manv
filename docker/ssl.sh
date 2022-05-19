#!/bin/bash

# TODO: checking if this whole script gets executed correctly

if [[ -z "${DOMAIN}" ]]; then
    echo "Error: Domain not set"
    exit 1
fi

CERTS_PATH="/ssl/certs"

mkdir -p /var/www/acme-challenge/.well-known/acme-challenge
chown -R www-data:www-data /var/www/acme-challenge

 acme.sh --issue \
--ecc \
--ocsp \
-d ${DOMAIN} \
--keylength ec-256 \
--cert-file ${CERTS_PATH}/cert.pem \
--key-file ${CERTS_PATH}/key.pem \
--fullchain-file ${CERTS_PATH}/fullchain.pem \
-w /var/www/acme-challenge \
--server letsencrypt \
--reloadcmd "nginx -s reload"

if [[ -f "${CERTS_PATH}/dhparam.pem" ]]; then
    echo "${CERTS_PATH}/dhparam.pem exists already, not creating new one"
else
    openssl dhparam -out ${CERTS_PATH}/dhparam.pem 4096
fi

# TODO not checking if anything valid is in the files, e.g. files could be empty
if [[ -f "${CERTS_PATH}/dhparam.pem"  && -f "${CERTS_PATH}/cert.pem" && -f "${CERTS_PATH}/key.pem" && -f "${CERTS_PATH}/fullchain.pem" ]]; then
    echo "starting now to enable https in nginx"
else
    echo "not all necessary certs exits in ${CERTS_PATH}, maybe acme.sh couldn't connect to letsencrypt"
    exit 1
fi

if ${ENABLE_HSTS}; then
    cp -a /etc/nginx/conf.d/https-securits-headers.template /etc/nginx/conf.d/https-security-headers
fi

echo "ssl.sh done, now back to docker-entrypoint.sh"
