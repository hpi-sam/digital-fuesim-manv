#!/bin/bash

if [[ ${SSL_ENABLE} ]]; then
    source ssl.sh
fi

nginx &

npm run start:once
