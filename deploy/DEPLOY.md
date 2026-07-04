# Kutt deployment guide for hails.live

This walks through deploying Kutt behind Caddy on your Linux VPS using Docker Compose and SQLite. Every command runs on the VPS unless stated otherwise.

## Assumptions

These were my defaults because you were away. Change any and tell me.

* Hostname: l.hails.live (a subdomain). If you want the root hails.live instead, edit DEFAULT_DOMAIN in .env and the hostname in the Caddy block.
* Database: SQLite (one file, no separate server).
* Runtime: Docker Compose, image built from your fork.
* Access: you run these steps. I prepared all files.

## Prerequisites on the VPS

* Docker and the Docker Compose plugin installed.
* Caddy installed and already serving your other sites.
* DNS: an A record (and AAAA if you use IPv6) for l.hails.live pointing at the VPS public IP. TLS will not issue until DNS resolves.

## Step 1. Get the code onto the VPS

Clone your fork:

    git clone https://github.com/Hailey-Ross/kutt.git
    cd kutt

## Step 2. Place the production files

From this repo, the deploy folder contains what you need. On the VPS, put the compose file and env in the repo root:

    cp deploy/docker-compose.prod.yml ./docker-compose.prod.yml
    cp deploy/.env.production ./.env

Open .env and confirm DEFAULT_DOMAIN and SITE_NAME. The JWT_SECRET is already filled with a strong random value.

## Step 3. Build and start

    docker compose -f docker-compose.prod.yml up -d --build

The container runs database migrations automatically on start, then serves on 127.0.0.1:3000. Check it is healthy:

    docker compose -f docker-compose.prod.yml ps
    curl -I http://127.0.0.1:3000

## Step 4. Wire up Caddy

Append the block from deploy/Caddyfile.snippet to your Caddyfile (commonly /etc/caddy/Caddyfile), then reload:

    caddy reload --config /etc/caddy/Caddyfile

Caddy will obtain a certificate for l.hails.live automatically once DNS resolves.

## Step 5. Create your admin account

Visit https://l.hails.live/create-admin in a browser. This first run page appears only while no user exists. Set your email and password. After this, the page redirects to login and cannot be used again.

## Step 6. Smoke test

* Log in at https://l.hails.live/login
* Create a short link.
* Open the short link and confirm it redirects over HTTPS.

## Everyday operations

* View logs: docker compose -f docker-compose.prod.yml logs -f
* Update to latest code: git pull, then docker compose -f docker-compose.prod.yml up -d --build
* Stop: docker compose -f docker-compose.prod.yml down
* The SQLite database lives in the db_data_sqlite Docker volume. Back it up by copying the volume contents or by using docker cp on the container path /var/lib/kutt.

## Notes

* The app binds only to localhost, so nothing is publicly reachable except through Caddy.
* Email is disabled, so password reset is off. Keep your admin password safe.
* To allow more accounts later, set DISALLOW_REGISTRATION=false in .env and restart, or create users from the admin panel.
