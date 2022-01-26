#!/bin/sh
set -e

# Process the nginx template
SOURCE_FILE="/etc/nginx/conf.d/peertube.template"
TARGET_FILE="/etc/nginx/conf.d/default.conf"
export WEBSERVER_HOST="$PEERTUBE_WEBSERVER_HOSTNAME"
export WEBSERVER_IP="$PEERTUBE_WEBSERVER_IP"
export PEERTUBE_HOST="peertube:9000"

envsubst '${WEBSERVER_HOST} ${PEERTUBE_HOST} ${WEBSERVER_IP}' < $SOURCE_FILE > $TARGET_FILE

while :; do
  sleep 12h & wait $!;
  nginx -s reload;
done &

nginx -g 'daemon off;'
