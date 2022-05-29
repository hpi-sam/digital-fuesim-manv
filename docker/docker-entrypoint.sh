#!/bin/bash

set -e

nginx &

npm run migration:run:prod

NODE_ENV=production node --experimental-specifier-resolution=node dist/src/index.js
