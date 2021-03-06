#!/bin/sh

set -eu

npm run clean:server:test

npm run concurrently -- -k -s first \
    "cd client/e2e && ../node_modules/.bin/wdio run ./wdio.browserstack.conf.ts" \
    "NODE_ENV=test NODE_APP_INSTANCE=1 NODE_CONFIG='{ \"rates_limit\": { \"api\": { \"max\": 5000 }, \"login\": { \"max\": 5000 } }, \"log\": { \"level\": \"warn\" }, \"signup\": { \"enabled\": false } }' node dist/server"
