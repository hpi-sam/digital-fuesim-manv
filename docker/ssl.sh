#!/bin/bash

# TODO: checking if this whole script gets executed correctly

echo "Info: HTTPS is enabled via DFM_SSL_ENABLE"

if [[ -z "${DFM_DOMAIN}" ]]; then
    echo "Error: Domain not set"
    exit 1
fi

DFM_CERTS_PATH="/ssl/certs"

mkdir -p /var/www/acme-challenge/.well-known/acme-challenge
chown -R www-data:www-data /var/www/acme-challenge

# ignore "that no renewal is needed"
set +e

 acme.sh --issue \
--ecc \
--ocsp \
-d ${DFM_DOMAIN} \
--keylength ec-256 \
--cert-home /ssl/acme.sh/certs \
--cert-file ${DFM_CERTS_PATH}/cert.pem \
--key-file ${DFM_CERTS_PATH}/key.pem \
--fullchain-file ${DFM_CERTS_PATH}/fullchain.pem \
-w /var/www/acme-challenge \
--server letsencrypt \
--reloadcmd "nginx -s reload"

set -e

# TODO: checking if anything valid is in the files, e.g. files could be empty
if [[ -f "${DFM_CERTS_PATH}/cert.pem" && -f "${DFM_CERTS_PATH}/key.pem" && -f "${DFM_CERTS_PATH}/fullchain.pem" ]]; then
    echo "Sucess: all needed cert files exist"
else
    echo "Erro: Not all necessary certs exits in ${DFM_CERTS_PATH}, maybe acme.sh couldn't connect to letsencrypt or letsencrypt couldn't reach this server over http port 80"
    exit 1
fi

if ${DFM_ENABLE_HSTS}; then
    cp -a /etc/nginx/conf.d/hsts.template /etc/nginx/conf.d/hsts
fi

echo "Sucess: ssl.sh done, now back to docker-entrypoint.sh"
