# Deploying to Production (Replit + getanaapp.com)

Replit's deployment system does NOT automatically run the build step when you republish. You must manually build inside Replit's shell first, then republish.

## Every time you push changes to production:

### Step 1 — QA on local first
```bash
npm run dev
```
Open `http://localhost:3000`, verify changes look correct (desktop + mobile in Chrome DevTools).

### Step 2 — Push to GitHub
```bash
git add <files>
git commit -m "your message"
git push
```

### Step 3 — Build inside Replit shell
Open the **Shell** tab in Replit and run:
```bash
git config pull.rebase false && git pull origin main && npm run build
```

### Step 4 — Republish
Go to **Deployments tab** in Replit → hit **Republish**.

Wait ~2 minutes, then verify at getanaapp.com.

---

## Why this is necessary
Replit's deployment snapshots the workspace at deploy time but does not re-run the build command on republish. The `npm run build` in the shell compiles the latest code into `.next/`, and the subsequent republish serves that freshly built output.
