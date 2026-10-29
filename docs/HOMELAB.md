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


## Acceptance checklist

Run this from a phone or another device on the same LAN/Tailscale network after an update:

1. Open the VibeCheck URL and analyze a public GitHub repository.
2. Confirm the concepts include file paths, line ranges, and visible code evidence.
3. Open a concept in Code Detective; confirm its code snippet and explanation match the cited evidence.
4. Start the Knowledge Check, answer both questions, and confirm the session result distinguishes demonstrated from unverified knowledge.
5. Refresh the Code Detective and Knowledge Check pages while the guest session is active; both should restore.
6. Reopen the same public repository and confirm the app still completes analysis. Snapshot caching is in-memory and short-lived; it is an optimization, not durable storage.
7. Try an invalid GitHub URL and a nonexistent public repository; confirm each produces a clear error and the app remains usable.

Guest sessions and caches are temporary. Restarting the container clears in-memory data. Do not treat the checklist as a security review or expose port 3000 publicly.
