# Deploying to Hetzner with Kamal

This app is set up for [Kamal](https://kamal-deploy.org/) deployment to a Hetzner VPS (or any Linux server with SSH and Docker). Images are stored in **GitHub Container Registry (ghcr.io)**.

## Prerequisites

- **Ruby** (for Kamal CLI). Install via [rbenv](https://github.com/rbenv/rbenv) or system package:
  ```bash
  gem install kamal
  ```
- **Docker** locally (to build the image).
- **Hetzner VPS**: Ubuntu 22.04 or 24.04, with your SSH key installed.
- **Domain**: A record pointing to your server IP (required for Let’s Encrypt SSL).

## One-time setup

### 1. Create a server on Hetzner

- Create a VPS (e.g. CX22 or CPX11), Ubuntu 22.04/24.04.
- Add your SSH public key.
- Note the server **IP address**.

### 2. Configure DNS

- Create an **A** record: `your-domain.com` → server IP.
- (Optional) `www.your-domain.com` → same IP or CNAME to `your-domain.com`.

### 3. Edit Kamal config (single VM for both environments)

- **`config/deploy.yml`** (base): set **`YOUR_SERVER_IP`** to your single Hetzner server IP (used by both staging and production). Also uses **ghcr.io**; for local deploys, set `KAMAL_REGISTRY_USERNAME` in `.kamal/secrets` if needed.
- **`config/deploy.staging.yml`** and **`config/deploy.production.yml`**: no server IP to set – they use the base config and are distinguished by **service name** (`crm-app-staging` / `crm-app-production`) and separate Postgres data dirs so both run on the same VM without conflict.

### 4. Secrets

```bash
cp .kamal/secrets.example .kamal/secrets
```

Edit **`.kamal/secrets`** and set:

- **`KAMAL_REGISTRY_PASSWORD`**: For **ghcr.io**, a GitHub PAT with `read:packages` (and `write:packages` if you push from your machine). CI uses `GITHUB_TOKEN` and does not need this secret.
- **`POSTGRES_PASSWORD`**: strong password for PostgreSQL.
- **`DATABASE_URI`**: Use the correct Postgres host per environment (container name on the shared VM):
  - Staging: `postgres://payload:PASSWORD@crm-app-staging-postgres:5432/crm_db`
  - Production: `postgres://payload:PASSWORD@crm-app-production-postgres:5432/crm_db`  
    (use the same password as `POSTGRES_PASSWORD` for that environment).
- **`PAYLOAD_SECRET`**: e.g. `openssl rand -hex 32`.

Do **not** commit `.kamal/secrets`.

### 5. Bootstrap server and PostgreSQL (once per environment on the same VM)

Install Docker and Kamal proxy on the server (run once; shared by both environments):

```bash
kamal setup -d staging
# or kamal setup -d production  (same server – proxy is shared)
```

Start PostgreSQL for each environment (run once per environment; each has its own data dir):

```bash
kamal accessory boot postgres -d staging
kamal accessory boot postgres -d production
```

### 6. Migrations (automatic after deploy)

Payload migrations run **automatically** after every deploy via a Kamal **post-deploy** hook (`.kamal/hooks/post-deploy`). The hook runs `pnpm payload migrate` once on the primary app container, so:

- **CI and manual deploys**: Migrations run right after `kamal deploy` (or `kamal deploy -d staging` / `-d production`). If migrations fail, the deploy is aborted.
- **To skip the hook** (e.g. emergency rollback without running migrations): `kamal deploy --skip-hooks`.
- **To run migrations only** (e.g. after fixing a failed migration): SSH into the server and run inside the app container, or run `kamal app exec -d staging --primary 'pnpm payload migrate'` from your machine.

## Deploy

Build the image, push it, and deploy the app:

```bash
kamal deploy
```

Subsequent deploys:

```bash
kamal deploy
```

## Useful commands

| Command                                                  | Description                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| `kamal deploy -d staging` / `kamal deploy -d production` | Deploy to staging or production (same VM)                           |
| `kamal app logs -d staging`                              | Stream app logs (add `-d production` for production)                |
| `kamal accessory reboot postgres -d staging`             | Restart staging Postgres (same with `-d production`)                |
| `kamal remove -d staging`                                | Remove staging app containers (does not remove accessories or data) |

## Architecture (single VM for staging and production)

- **One server**: Staging and production both run on the same VM. They are separated by **service name** (`crm-app-staging` vs `crm-app-production`), so container names and data do not clash.
- **App**: Next.js + Payload in a single container (port 3000) per environment, built from the repo’s `Dockerfile`.
- **Proxy**: One Kamal Traefik proxy on the server (ports 80/443), SSL via Let’s Encrypt; routes by host (crm-staging.whizystems.com → staging, crm.whizystems.com → production).
- **PostgreSQL**: One Postgres accessory per environment (`crm-app-staging-postgres`, `crm-app-production-postgres`) with separate data dirs (`postgres-staging-data`, `postgres-production-data`).

## Automated deployments (GitHub Actions)

Deployments run automatically:

| Trigger                      | Destination | URL                                |
| ---------------------------- | ----------- | ---------------------------------- |
| **Push to `main`**           | Staging     | https://crm-staging.whizystems.com |
| **Tag push** (e.g. `v1.0.0`) | Production  | https://crm.whizystems.com         |

### One-time setup for CI

1. **Set the single server IP** in **`config/deploy.yml`**: replace `YOUR_SERVER_IP` with your Hetzner server IP (staging and production both use this VM).

2. **Configure GitHub repository secrets** (Settings → Secrets and variables → Actions):

   The workflow uses **ghcr.io** and `GITHUB_TOKEN` for the registry (no registry secrets needed).

   | Secret                         | Used by    | Description                                                           |
   | ------------------------------ | ---------- | --------------------------------------------------------------------- |
   | `SSH_PRIVATE_KEY`              | Both       | Private key that can SSH into the server (one VM for both)            |
   | `STAGING_DATABASE_URI`         | Staging    | `postgres://payload:PASSWORD@crm-app-staging-postgres:5432/crm_db`    |
   | `STAGING_PAYLOAD_SECRET`       | Staging    | Payload secret for staging                                            |
   | `STAGING_POSTGRES_PASSWORD`    | Staging    | PostgreSQL password for staging                                       |
   | `PRODUCTION_DATABASE_URI`      | Production | `postgres://payload:PASSWORD@crm-app-production-postgres:5432/crm_db` |
   | `PRODUCTION_PAYLOAD_SECRET`    | Production | Payload secret for production                                         |
   | `PRODUCTION_POSTGRES_PASSWORD` | Production | PostgreSQL password for production                                    |

3. **Bootstrap the server once** (one VM; run setup once, then boot Postgres for each environment):
   - `kamal setup -d staging` (or `-d production` – proxy is shared).
   - `kamal accessory boot postgres -d staging`
   - `kamal accessory boot postgres -d production`

4. **(Optional)** Create GitHub **environments** `staging` and `production` in Settings → Environments and reference them in the workflow for protection rules (e.g. require approval for production).

### Manual deploy with destinations

```bash
# Staging (e.g. after merging to main)
kamal deploy -d staging

# Production (e.g. after pushing a tag)
kamal deploy -d production
```

## Troubleshooting

- **SSL errors**: Ensure the domain A record points to the server and ports 80/443 are open (Hetzner firewall and any cloud firewall).
- **Database connection refused**: Ensure the postgres accessory is running (`kamal accessory details postgres -d staging` or `-d production`) and that `DATABASE_URI` uses the correct host: `crm-app-staging-postgres` or `crm-app-production-postgres`.
- **Registry auth**: Run `kamal registry login` to verify registry credentials.
