#!/bin/bash

echo "Info: HTTPS is enabled via DFM_ENABLE_SSL"

if [[ -z "${DFM_DOMAIN}" ]]; then
    echo "Error: Domain not set"
    exit 1
fi

DFM_CERTS_PATH="/ssl/certs"

mkdir -p /var/www/acme-challenge/.well-known/acme-challenge
chown -R www-data:www-data /var/www/acme-challenge

# ignore "that no renewal is needed"
set +e

# TODO: checking if this acme.sh renewed or created certs sucessfully (look at acme.sh error codes/numbers)

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

# right now only checking if files exist
# TODO: checking if anything valid is in the files, e.g. files could be empty
#       or check via something like openssl s_client -connect
if [[ -f "${DFM_CERTS_PATH}/cert.pem" && -f "${DFM_CERTS_PATH}/key.pem" && -f "${DFM_CERTS_PATH}/fullchain.pem" ]]; then
    echo "Sucess: all needed cert files exist"
else
    echo "Error: Not all necessary cert files exits in ${DFM_CERTS_PATH}, maybe acme.sh couldn't connect to letsencrypt or letsencrypt couldn't reach this server over http port 80"
    exit 1
fi

if ${DFM_ENABLE_HSTS}; then
    echo "Info: HSTS is enabled via DFM_ENABLE_HSTS"
    cp -a /etc/nginx/conf.d/hsts.template /etc/nginx/conf.d/hsts
fi

echo "Sucess: ssl.sh done, now back to docker-entrypoint.sh"
