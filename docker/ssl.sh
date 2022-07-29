#!/bin/bash

echo "Info: HTTPS is enabled via DFM_ENABLE_SSL"

if [[ -z "${DFM_DOMAIN}" ]]; then
    echo "Error: Domain not set"
    exit 1
fi

mkdir -p /var/www/acme-challenge/.well-known/acme-challenge
chown -R www-data:www-data /var/www/acme-challenge

# removes certs ánd therefore forcing acme.sh to create new ones
# after everything works don't forget to disable, issueing too many certs from letsencrypt could create a ratelimit
if ${DFM_FORCE_NEW_SSL_CERTS}; then
    rm -r  ${DFM_PERSISTENT_DATA_PATH}/acme.sh/certs/*
    rm -r  ${DFM_PERSISTENT_DATA_PATH}/certs/*
fi

# ignore "that no renewal is needed"
set +e

# TODO: checking if this acme.sh renewed or created certs sucessfully (look at acme.sh error codes/numbers)

 acme.sh --issue \
--ecc \
--ocsp \
-d ${DFM_DOMAIN} \
--keylength ec-256 \
--cert-home ${DFM_PERSISTENT_DATA_PATH}/acme.sh/certs \
--cert-file ${DFM_PERSISTENT_DATA_PATH}/certs/cert.pem \
--key-file ${DFM_PERSISTENT_DATA_PATH}/certs/key.pem \
--fullchain-file ${DFM_PERSISTENT_DATA_PATH}/certs/fullchain.pem \
-w /var/www/acme-challenge \
--server letsencrypt \
--reloadcmd "nginx -s reload"

set -e

# right now only checking if files exist
# TODO: checking if anything valid is in the files, e.g. files could be empty
#       or check via something like openssl s_client -connect
if [[ -f "${DFM_PERSISTENT_DATA_PATH}/certs/cert.pem" && -f "${DFM_PERSISTENT_DATA_PATH}/certs/key.pem" && -f "${DFM_PERSISTENT_DATA_PATH}/certs/fullchain.pem" ]]; then
    echo "Sucess: all needed cert files exist"
else
    echo "Error: Not all necessary cert files exits in ${DFM_PERSISTENT_DATA_PATH}/certs, maybe acme.sh couldn't connect to letsencrypt or letsencrypt couldn't reach this server over http port 80"
    exit 1
fi

# writing the correct data path into nginx
echo "ssl_certificate ${DFM_DFM_PERSISTENT_DATA_PATH}/certs/fullchain.pem;
ssl_trusted_certificate ${DFM_PERSISTENT_DATA_PATH}/certs/fullchain.pem;
ssl_certificate_key ${DFM_PERSISTENT_DATA_PATH}/certs/key.pem;" > /etc/nginx/conf.d/certs

if ${DFM_ENABLE_HSTS}; then
    echo "Info: HSTS is enabled via DFM_ENABLE_HSTS"
    cp -a /etc/nginx/conf.d/hsts.template /etc/nginx/conf.d/hsts
fi

echo "Sucess: ssl.sh done, now back to docker-entrypoint.sh"
