#!/usr/bin/env sh
set -eu
docker compose up --build -d
echo "SecureDesk est disponible sur http://localhost:3000"

