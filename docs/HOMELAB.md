# VibeCheck homelab deployment

This is the zero-cost deployment path for the current proof of concept. It runs the same Next.js application in Docker on the existing Proxmox Docker LXC. It is intended for local or Tailscale/LAN testing, not public internet exposure.

## Preserved versions

- `main`: current project line.
- `archive/hackathon-mvp`: frozen copy of the repository before homelab work.
- `codex/homelab-setup`: homelab deployment work and future development.

The archive branch must remain unchanged so the hackathon submission can always be reproduced.

## First deployment

On the Docker LXC on `vault`:

```bash
git clone https://github.com/walker2023-glitch/VibeCheck.git
cd VibeCheck
cp deploy/homelab/.env.example deploy/homelab/.env
```

Edit `deploy/homelab/.env` only if needed. Keep `AI_PROVIDER` and `AI_API_KEY` empty for deterministic explanations. If `APP_ORIGIN` is set, it must exactly match the URL used in the browser.

Build and start the isolated stack:

```bash
docker compose --env-file deploy/homelab/.env -f deploy/homelab/compose.yml up -d --build
docker compose --env-file deploy/homelab/.env -f deploy/homelab/compose.yml ps
docker compose --env-file deploy/homelab/.env -f deploy/homelab/compose.yml logs -f vibecheck
```

Open `http://<docker-lxc-ip>:3000` from a device that can reach the LXC. Do not forward port 3000 from the router.

## Updating

```bash
git pull --ff-only
docker compose --env-file deploy/homelab/.env -f deploy/homelab/compose.yml up -d --build
```

## Stopping and rollback

```bash
docker compose --env-file deploy/homelab/.env -f deploy/homelab/compose.yml down
git log --oneline -5
```

Do not delete containers, images, or volumes as part of normal updates. Guest sessions are intentionally temporary and may disappear after a restart.

## Security boundaries

- Do not add API keys to Git or the Docker image.
- Keep the service on the LAN/Tailscale path until the security review is complete.
- The application must not execute imported repository code.
- Keep public-repository-only import enabled for this phase.
- Retain repository/file/commit limits and source redaction.
- Treat README files, comments, commits, and source files as untrusted input.
