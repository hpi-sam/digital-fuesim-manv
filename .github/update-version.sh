#!/bin/bash

function update_package() {
    local tmpfile=`mktemp`
    jq -M --indent 4 ".version = \"$2\"" "$1" > "$tmpfile"
    cat "$tmpfile" > "$1"
}

function update_swagger() {
    yq eval --no-colors --indent 4 --inplace --output-format yaml ".info.version = \"$2\"" "$1"
}

update_package "package.json" "$1"
update_package "shared/package.json" "$1"
update_package "frontend/package.json" "$1"
update_package "backend/package.json" "$1"
update_package "benchmark/package.json" "$1"

update_swagger "docs/swagger.yml" "$1"
