#!/bin/sh
# docker-entrypoint.sh

# Generate env-config.js with runtime environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_API_KEY: "${VITE_API_KEY}",
  VITE_AUTH_DOMAIN: "${VITE_AUTH_DOMAIN}",
  VITE_PROJECT_ID: "${VITE_PROJECT_ID}",
  VITE_STORAGE_BUCKET: "${VITE_STORAGE_BUCKET}",
  VITE_MESSAGING_SENDER_ID: "${VITE_MESSAGING_SENDER_ID}",
  VITE_APP_ID: "${VITE_APP_ID}",
  VITE_IMAGE_PLACEHOLDER: "${VITE_IMAGE_PLACEHOLDER}"
};
EOF

echo "env-config.js generated successfully."

# Start Nginx in the foreground
exec nginx -g 'daemon off;'
