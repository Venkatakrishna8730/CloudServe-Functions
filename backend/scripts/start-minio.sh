#!/bin/bash

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^minio-server$"; then
  echo "Creating minio-server container..."
  docker run -d \
    --name minio-server \
    -p 9000:9000 \
    -p 9001:9001 \
    -e MINIO_ROOT_USER=admin \
    -e MINIO_ROOT_PASSWORD=password123 \
    minio/minio \
    server /data --console-address ":9001"
else
  echo "Starting existing minio-server..."
  docker start minio-server
fi

echo "Waiting for MinIO to be ready..."

# Poll until MinIO is accessible
until curl -s http://localhost:9000 >/dev/null 2>&1; do
  printf "."
  sleep 1
done

echo ""
echo "MinIO is ready!"
