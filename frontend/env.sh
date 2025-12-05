#!/bin/sh

# Recreate config file
rm -f /usr/share/nginx/html/env-config.js
touch /usr/share/nginx/html/env-config.js

# Add assignment
echo "window.env = {" >> /usr/share/nginx/html/env-config.js

# Process each environment variable starting with VITE_
printenv | grep "^VITE_" | while IFS='=' read -r varname varvalue
do
  # Use varvalue directly (BusyBox sh does not support indirect expansion)
  echo "  $varname: \"$varvalue\"," >> /usr/share/nginx/html/env-config.js
done

echo "}" >> /usr/share/nginx/html/env-config.js

# Execute the passed command (nginx)
exec "$@"
