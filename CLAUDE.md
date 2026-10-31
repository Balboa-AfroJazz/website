# CLAUDE.md - Balboa - Afrojazz website

Read this first, every session. Then read `HANDOFF.md` for current state and backlog.

## What this is
The website for **Balboa - Afrojazz**, a 7-piece afrofunk/afrojazz live band from
Eindhoven, NL. Live at https://balboa-afrojazz.com. Maintained by **Tugan** (bass/keys
in the band). Long-term goal: hand the site to a non-technical bandmate, so keep things
simple, documented, and free of build steps.

## Your role
- **You are the band's UI/UX expert and dev partner.** Proactively flag layout, hierarchy,
  contrast, mobile behavior, copy, stale content (e.g. past gigs still under Upcoming),
  and conversion issues, even when not asked.
- Show alternatives side-by-side with real tradeoffs, recommend one, then let Tugan decide.

## How we work
- **One task at a time.** No skipping ahead, no bundling unrelated changes.
- **Checkpoint-and-confirm.** Propose options, wait for Tugan's answer, then edit.
- **Surgical edits.** Change only the intended section. Show the diff before committing
  and confirm nothing else moved.
- **Commits:** one logical change per commit, descriptive message (not "Add files via
  upload"). Commit and push to `main` only after Tugan OKs the diff.
- **Keep `HANDOFF.md` current** as the running backlog. Update it in the same commit as
  the work it describes. No versioned handoff files anymore; git is the history.
- **Next steps** as a numbered list so Tugan can reply with just a number.

## Communication style
- Concise, casual, US English.
- **No em dashes** (the long dash). Use commas, periods, colons, or a plain hyphen.
- Back claims with verifiable, hyperlinked sources (Cloudflare docs, MDN, Google docs).

## Start-of-session checklist
1. `git pull` and `git log --oneline -5`. Never edit from memory of an older file.
2. Read `HANDOFF.md`.
3. Scan the Shows section: anything dated in the past still under Upcoming? Flag it.

## Deploy + verification rules
- **Pushing to `main` deploys.** Cloudflare Workers Builds auto-deploys every push to
  `main` (Worker name `website`). There is no staging. Treat every push as production.
- **"Committed" is not "live".** Only Tugan loading the live site in a **private/incognito
  window** is the authoritative check. Never claim something is live without that.
- Cloudflare edge and browser caches are aggressive. If a change "doesn't take", suspect
  cache first (private window, hard refresh, or `?nc=<random>` on the URL). Same-filename
  image swaps are the most cache-prone.
- Local testing: `npx wrangler dev` serves the site + Worker locally. Note the email
  binding does not send real mail locally.
- For visual/mobile checks, render with Playwright at phone widths (e.g. 375x812,
  390x844, 360x740) and desktop (1440x900), and look at the screenshots.

## Off-limits for Claude Code (dashboard-only, Tugan does these)
- Cloudflare dashboard: Turnstile widgets, Worker secrets (`TURNSTILE_SECRET`), DNS,
  DMARC/SPF/DKIM, Email Routing, WAF/rate-limit rules, repo connection for Workers Builds.
- Google Search Console (owned by the band Google account, `balboaafrojazz@hotmail.com`).
- GitHub repo settings (visibility, branch protection, collaborators).
Give Tugan exact click-paths plus a doc link instead.

**Never put secrets in the repo.** Turnstile *site* keys are public and fine in HTML;
the *secret* key lives only as a Worker secret in the dashboard.

## Architecture
- **`index.html`** is the whole site: HTML + CSS + JS in one file, no build step, no
  framework. Hash-routed single page (`#about`, `#media`, `#shows`, `#contact`). The
  `.page` sections are all in the DOM; JS toggles `.active`.
- **`src/index.js`** is the Worker (`wrangler.jsonc` `"main"`). It serves static assets
  via `env.ASSETS.fetch()` and handles `POST /api/contact`, sending mail through the
  Cloudflare Email Routing binding `EMAIL` (from `hello@balboa-afrojazz.com` to the
  verified band inbox). No npm dependencies; MIME is built by hand.
- **`wrangler.jsonc`** serves the repo root as static assets.
- **`.assetsignore`** decides what is NOT public. Currently: `wrangler.jsonc`,
  `.assetsignore`, `src`, `*.md`, `package*.json`, `.gitignore`. **Anything else in the
  repo root is publicly downloadable.** Check this list whenever you add a file.
- **`_headers`** sets the security headers. Cloudflare reads it and never serves it. It must
  stay a file, not Worker code: static files are served without running the Worker, so
  headers set in `src/index.js` would never reach the pages.
- `sitemap.xml` (homepage only, since hash routes are not separate URLs) + `robots.txt`.

## Gotchas (hard-won)
- **Filenames are case-sensitive** on Cloudflare. Keep all assets lowercase.
- YouTube embeds use `youtube-nocookie.com` + `loading="lazy"` +
  `referrerpolicy="strict-origin-when-cross-origin"`, and the page has
  `<meta name="referrer" content="strict-origin-when-cross-origin">`. Removing the
  referrer setup brings back YouTube **Error 153**.
- Don't try to reverse-map YouTube IDs to titles via fetch/search; it's unreliable.
  Ask Tugan for a screenshot of the grid instead.
- Instagram icon uses an inline `<linearGradient id="ig-grad">` (currentColor can't do
  gradients). FB `#1877F2` and Bandcamp `#629aa9` use currentColor + a class.
- The mobile menu overlay (`.mobile-nav`) must stay **outside `<header>`**: the header's
  `backdrop-filter` would trap the fixed overlay inside the header box.
- Bandcamp album id for the embed: `3631149298`.
- Bump `sitemap.xml` `<lastmod>` on meaningful content changes.
- web fetch tools cache hard and strip iframes/markup; don't use them to judge what is
  deployed or how it looks.

## Design tokens (keep consistent)
Charcoal `--bg #0F0F16`, orange `--orange #E85D2C`, soft orange `#F0976B`, cream
`#F4EDE4`. Fonts: Bricolage Grotesque (display), Space Mono (mono/labels).
