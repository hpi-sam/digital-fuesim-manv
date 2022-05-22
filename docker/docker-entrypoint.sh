#!/bin/bash

nginx &

NODE_ENV=production node --experimental-specifier-resolution=node dist/src/index.js
