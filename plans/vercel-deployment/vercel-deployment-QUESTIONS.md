# Vercel Deployment — Questions

All clarifying questions were resolved during the collaborative design session. See the plan for decisions made.

**Summary of decisions made during design:**
- Hosting platform: Vercel Hobby (free tier) — chosen for 100 GB/month free bandwidth vs Firebase's ~10.8 GB/month daily ceiling
- Audio file strategy: commit MP3s to `public/audio/` — simplest approach for a 14-track catalog
- Domain: `alienunderpants.io` (apex) — DNS currently managed at Squarespace following Google's sale of Google Domains in 2023
- No backend required — fully static build
- Upgrade path documented: migrate audio to Cloud Storage when catalog exceeds ~30 songs

**All items resolved.**
GitHub remote confirmed: [github.com/ekemper/moon-legs](https://github.com/ekemper/moon-legs) — public repo, 2 commits on `main`. Vercel can import this directly in Phase 2 with no additional setup.
