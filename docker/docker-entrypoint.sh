#!/bin/bash

set -e

nginx &

NODE_ENV=migration node --experimental-specifier-resolution=node ./node_modules/typeorm/cli -d dist/src/database/migration-datasource.js migration:run

NODE_ENV=production node --experimental-specifier-resolution=node dist/src/index.js
