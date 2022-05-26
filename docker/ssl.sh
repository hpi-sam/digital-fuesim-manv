#!/bin/bash

# TODO: checking if this whole script gets executed correctly

echo "Info: HTTPS is enabled via SSL_ENABLE"

if [[ -z "${DOMAIN}" ]]; then
    echo "Error: Domain not set"
    exit 1
fi

CERTS_PATH="/ssl/certs"

mkdir -p /var/www/acme-challenge/.well-known/acme-challenge
chown -R www-data:www-data /var/www/acme-challenge

# ignore "that no renewal is needed" and for the dhparam check command
set +e

 acme.sh --issue \
--ecc \
--ocsp \
-d ${DOMAIN} \
--keylength ec-256 \
--cert-home /ssl/acme.sh/certs \
--cert-file ${CERTS_PATH}/cert.pem \
--key-file ${CERTS_PATH}/key.pem \
--fullchain-file ${CERTS_PATH}/fullchain.pem \
-w /var/www/acme-challenge \
--server letsencrypt \
--reloadcmd "nginx -s reload"

if openssl dhparam -check < ${CERTS_PATH}/dhparam.pem > /dev/null; then
    echo "Skip: ${CERTS_PATH}/dhparam.pem exists already, not creating new one"
else
    openssl dhparam -out ${CERTS_PATH}/dhparam.pem 4096
fi

set -e

# TODO: checking if anything valid is in the files, e.g. files could be empty
if [[ -f "${CERTS_PATH}/dhparam.pem"  && -f "${CERTS_PATH}/cert.pem" && -f "${CERTS_PATH}/key.pem" && -f "${CERTS_PATH}/fullchain.pem" ]]; then
    echo "Sucess: all needed cert files and dhparam.pem exist"
else
    echo "Erro: Not all necessary certs exits in ${CERTS_PATH}, maybe acme.sh couldn't connect to letsencrypt or letsencrypt couldn't reach this server over http port 80"
    exit 1
fi

if ${ENABLE_HSTS}; then
    cp -a /etc/nginx/conf.d/hsts.template /etc/nginx/conf.d/hsts
fi

echo "Sucess: ssl.sh done, now back to docker-entrypoint.sh"
