# Vercel Deployment Plan — Moon Legs

## Summary / goal

Deploy the Moon Legs React PWA to Vercel Hobby (free tier) and serve it at `alienunderpants.io` with automatic HTTPS and a global CDN. The app is a fully static CRA build (HTML, JS, CSS, MP3 audio files) with no backend. The goal is a zero-cost, production-quality hosting setup that auto-deploys on every `git push` to `main`.

---

## Scope

**In scope**
1. Add `public/audio/` directory to the repo and document how to populate it with MP3 files
2. Add `vercel.json` with correct cache headers for audio files and PWA service worker
3. Create a Vercel project linked to the GitHub repo with auto-deploy on push to `main`
4. Configure `alienunderpants.io` as the production custom domain in Vercel
5. Update DNS records at Squarespace (current DNS host) to point the domain to Vercel
6. Verify SSL provisioning and end-to-end production smoke test

**Out of scope**
- Migrating audio to Cloud Storage (deferred; revisit if catalog grows beyond ~30 songs or traffic exceeds 100 GB/month)
- Any backend services, APIs, or databases
- CI/CD beyond Vercel's built-in GitHub integration
- Analytics or Speed Insights instrumentation (Vercel offers these but they are optional extras)
- `www` subdomain setup (apex domain only for now; can add redirect later)

**Dependencies**
- GitHub repository: ✓ confirmed at [github.com/ekemper/moon-legs](https://github.com/ekemper/moon-legs) — public, `main` branch, 2 commits
- MP3 audio files must exist on the user's local machine and be added to `public/audio/` before the first deploy
- Access to the Squarespace DNS panel for `alienunderpants.io`
- A Vercel account (free, created at [vercel.com](https://vercel.com))

---

## Approach

### Phase 1 — Repo preparation (code changes)

Prepare the repository so the build is production-ready and Vercel is correctly configured before any account setup begins.

1. Create `public/audio/` directory with a `.gitkeep` so git tracks it
2. Add the 14 MP3 files to `public/audio/` (manual step; files are referenced by name in `App.js`)
3. Add `vercel.json` with cache headers (audio files: 1-week cache; service worker + manifest: no-cache)
4. Run `npm run build` locally to confirm the build is clean
5. Commit everything and push to GitHub (`main` branch)

See [Technical implementation detail — Phase 1](#phase-1-detail) for exact file contents.

**Checkpoint:** GitHub shows a clean commit with `public/audio/` populated and `vercel.json` present. `npm run build` exits 0 with no warnings about missing assets.

### Phase 2 — Vercel project setup (browser, ~10 min)

Create the Vercel project and verify the first deployment before touching DNS.

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository**
2. Select the `moon-legs` GitHub repo
3. Verify auto-detected settings (Vercel recognizes CRA automatically):
   - **Framework preset:** Create React App
   - **Build command:** `npm run build`
   - **Output directory:** `build`
   - **Install command:** `npm install`
4. Click **Deploy** — Vercel builds and deploys to a `*.vercel.app` URL
5. Open the preview URL and smoke-test: page loads, all 14 tracks are listed, audio plays, PWA manifest is served correctly

**Checkpoint:** App is live and functional at the `*.vercel.app` URL. Audio plays without 404s.

### Phase 3 — Custom domain (Vercel dashboard + Squarespace DNS)

Wire `alienunderpants.io` to the Vercel deployment.

1. In Vercel dashboard → project → **Settings → Domains** → **Add Domain** → enter `alienunderpants.io`
2. Vercel will display the exact DNS records to add (an A record for the apex domain with their current edge IP)
3. In Squarespace DNS panel for `alienunderpants.io`:
   - Add **A record**: `@` → Vercel's IP (displayed in dashboard, typically `76.76.21.21`)
   - Add **CNAME record**: `www` → `cname.vercel-dns.com.` (catches `www.alienunderpants.io` traffic)
4. Wait for DNS propagation (typically 5–30 minutes; up to 48 hours globally)
5. Vercel auto-provisions an SSL certificate via Let's Encrypt once DNS resolves
6. Visit `https://alienunderpants.io` and confirm HTTPS is active with valid cert

**Checkpoint:** `https://alienunderpants.io` loads the app over HTTPS with a valid certificate. HTTP redirects to HTTPS automatically.

### Phase 4 — Production validation

Full smoke test on the live production domain.

1. Open `https://alienunderpants.io` — confirm page renders
2. Play each of the 14 audio tracks — confirm no 404s, audio loads and plays, progress bar works
3. Confirm PWA is installable (Chrome → address bar → install icon, or share sheet on iOS)
4. Check mobile layout at 375px viewport
5. Verify `service-worker.js` is served with `no-cache` header (DevTools → Network → filter `service-worker`)
6. Verify MP3 files are served with `Cache-Control: public, max-age=604800` (DevTools → Network → click any MP3)
7. Push a trivial change to `main` (e.g., a whitespace edit) and confirm Vercel auto-deploys within ~1 minute

**Checkpoint:** All 14 tracks play, HTTPS is valid, PWA installs, headers are correct, auto-deploy is verified.

---

## Technical implementation detail

### Phase 1 detail — File changes {#phase-1-detail}

#### `public/audio/` directory

Create the directory and populate it with these 14 files (exact filenames must match `App.js`):

```
public/audio/
  Afro-Interdimentional Contrabassoon.mp3
  Bacchanalia of the Tarsier.mp3
  Byzantine Parthenogenesis.mp3
  dispersive directly.mp3
  Ego Death Before Breakfast.mp3
  Inverted Inflorescence.mp3
  lunar orbit.mp3
  mediocre automaton.mp3
  misdirectoscopy.mp3
  Polystyrene Hellscape.mp3
  rave lather.mp3
  sleeping nose whistle of the machine god V2.mp3
  solipsistic prizm.mp3
  The Shrike.mp3
```

These filenames must exactly match the strings in the `audioFiles` array in `src/App.js`. Git will track binary MP3 files without issue at this catalog size (~100–150 MB total estimated).

#### `vercel.json`

```json
{
  "headers": [
    {
      "source": "/audio/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=604800"
        }
      ]
    },
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ]
}
```

**Rationale:**
- `/audio/*`: MP3 filenames are not content-addressed (not fingerprinted), so `immutable` is incorrect. One week (`604800s`) balances browser-side caching performance against the ability to update a track. Vercel CDN will cache these at edge nodes automatically.
- `/service-worker.js`: The CRA PWA service worker must be re-fetched on every page load so the browser can detect updates. `no-cache` forces a revalidation request (uses ETag/Last-Modified); the file is only re-downloaded if it changed. This is the [standard CRA recommendation](https://create-react-app.dev/docs/making-a-progressive-web-app/#offline-first-considerations).
- `/manifest.json`: Same reasoning as service worker — PWA manifest changes should be visible immediately.
- Vercel automatically handles cache headers for fingerprinted assets (`/static/js/*.js`, `/static/css/*.css`) — these get `immutable` headers from the framework preset. No need to configure them manually.

#### SPA routing

Vercel's CRA framework preset handles the SPA fallback automatically (all unmatched routes serve `index.html`). No `rewrites` configuration is needed in `vercel.json`.

### DNS records (Phase 3)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `@` (apex) | Vercel edge IP (get from dashboard) | 3600 |
| CNAME | `www` | `cname.vercel-dns.com.` | 3600 |

> Note: The exact Vercel A record IP is shown in the Vercel dashboard when you add the domain. As of 2025 it is `76.76.21.21`, but always use the value Vercel displays — it may change.

DNS propagation time varies. To check status: `dig alienunderpants.io A` or use [whatsmydns.net](https://www.whatsmydns.net).

### Vercel Hobby plan limits (verified from vercel.com/pricing, May 2026)

| Resource | Free allowance | Overage |
|----------|---------------|---------|
| Fast Data Transfer | 100 GB/month | $0.15/GB (requires Pro upgrade) |
| Edge Requests | 1M/month | $2/1M (requires Pro upgrade) |
| Deployments | Unlimited | — |
| Custom domains | 50 per project | — |
| SSL certificates | Included | — |
| Preview deployments | Included per PR | — |

For reference: 14 tracks × ~7 MB average = ~98 MB per full-catalog listen. At 100 GB/month free, that's ~1,020 full-catalog listens before any charge. The free tier is extremely unlikely to be exceeded for a personal music showcase.

---

## Risks & mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| MP3 filenames in `public/audio/` don't exactly match strings in `App.js` | Medium | Cross-reference `audioFiles` array before committing; test locally with `npm run build && npx serve build` |
| DNS propagation takes hours | Low-medium | Expected behavior; do Phase 3 at a low-traffic time. Use `dig` to monitor propagation. App remains available at `*.vercel.app` URL during transition. |
| SSL certificate fails to provision | Low | Usually caused by DNS not yet propagated. Wait and retry. Vercel retries automatically every few minutes. |
| Git repo is local-only (no GitHub remote yet) | ~~Unknown~~ **Resolved** | [github.com/ekemper/moon-legs](https://github.com/ekemper/moon-legs) confirmed — no setup needed. |
| Google Workspace DNS vs Squarespace DNS | Low | Google sold Google Domains to Squarespace in 2023. DNS is managed at Squarespace. If the domain is still showing in a Google admin panel, that's the Workspace domain verification record (MX/TXT for email) — leave those untouched when adding Vercel A records. |
| CRA service worker caches stale audio files | Low | `no-cache` on `service-worker.js` ensures the browser always checks for SW updates. The SW itself is configured by CRA to use a `StaleWhileRevalidate` strategy for static assets, which is acceptable. |
| Binary MP3 files slow down git clone | Low-medium | At ~100–150 MB total this is borderline but acceptable. If the catalog grows past ~30 songs, migrate audio to Cloud Storage and remove files from repo. |

---

## Open decisions

All decisions resolved during design. See approach for rationale.

Key decisions made:
- **Vercel over Firebase:** 100 GB/month free bandwidth vs Firebase's ~10.8 GB/month — critical advantage for an audio app
- **MP3s in repo:** Catalog is small enough; simplest path. Revisit when catalog exceeds ~30 songs
- **Apex domain only:** `alienunderpants.io` as primary; `www` configured as CNAME fallback. Can add explicit redirect later if needed
- **No analytics instrumentation:** Vercel's built-in dashboard shows basic traffic. Opt-in to `@vercel/analytics` later if desired

---

## Deliverables manifest

### Phase 1 — Repo preparation
1. NEW  `public/audio/.gitkeep` — Tracks the audio directory in git; MP3 files added alongside it (manual step)
2. NEW  `vercel.json` — Cache headers for audio files, service worker, and manifest

### Phase 2 — Vercel project setup
3. *(No file changes)* — Browser-only steps: create Vercel project, import GitHub repo, trigger first deploy, smoke-test `*.vercel.app` URL

### Phase 3 — Custom domain
4. *(No file changes)* — Browser-only steps: add `alienunderpants.io` in Vercel dashboard; DNS changes at Squarespace; wait for SSL provisioning

### Phase 4 — Production validation
5. *(No file changes)* — Validation checklist: HTTPS, all 14 tracks play, PWA installable, cache headers correct, auto-deploy verified

**Implementation protocol:** The implementing agent must follow the `plan-implementation` cursor rule when executing this plan.
