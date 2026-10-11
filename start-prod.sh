#!/bin/bash
cd apps/api && PORT=4000 node dist/main.js &
API_PID=$!
echo "API started: PID $API_PID"

cd ../web && PORT=3000 npm start &
WEB_PID=$!
echo "Web started: PID $WEB_PID"

echo "$API_PID" > /tmp/api-prod.pid
echo "$WEB_PID" > /tmp/web-prod.pid
