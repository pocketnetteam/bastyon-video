#!/bin/bash
npm run start
#First start options
# CONTAINER_ALREADY_STARTED="CONTAINER_ALREADY_STARTED_PLACEHOLDER"
# if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
#     touch $CONTAINER_ALREADY_STARTED
#     echo "-- First container startup --"
#     # Change Admin Password
#     echo $PEERTUBE_ROOT_PASSWORD | NODE_CONFIG_DIR=/app/config NODE_ENV=production npm run reset-password -- -u root;

#     # Install Plugins
#     NODE_CONFIG_DIR=/app/config NODE_ENV=production npm run plugin:install -- --npm-name peertube-plugin-pocketnet-auth;
# else
#     echo "-- Not first container startup --"
# fi
# Change Admin Password
echo $PEERTUBE_ROOT_PASSWORD | NODE_CONFIG_DIR=/app/config NODE_ENV=production npm run reset-password -- -u root;

# Install Plugins
NODE_CONFIG_DIR=/app/config NODE_ENV=production npm run plugin:install -- --npm-name peertube-plugin-pocketnet-auth;