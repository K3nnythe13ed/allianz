#!/bin/bash

set -e

if [ "${1:0:1}" = '-' ]; then
	set -- nginx "$@"
fi

mkdir -p /var/www/temp && mkdir -p /var/www/html && \
chown -R www-data:www-data /var/www

exec "$@"