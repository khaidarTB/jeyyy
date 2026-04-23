#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"

if [ "${DB_CONNECTION:-}" = "mysql" ]; then
    echo "Waiting for MySQL connection..."
    for i in {1..30}; do
        if php -r 'try { new PDO("mysql:host=".getenv("DB_HOST").";port=".getenv("DB_PORT").";dbname=".getenv("DB_DATABASE"), getenv("DB_USERNAME"), getenv("DB_PASSWORD")); exit(0);} catch (Throwable $e) { exit(1);}'; then
            echo "MySQL is ready."
            break
        fi

        if [ "$i" -eq 30 ]; then
            echo "MySQL connection timeout."
            exit 1
        fi

        echo "MySQL not ready yet ($i/30), retrying..."
        sleep 2
    done
fi

php artisan migrate --force --graceful
php artisan storage:link || true
php artisan optimize:clear || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
