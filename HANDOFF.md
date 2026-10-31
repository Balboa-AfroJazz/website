# HANDOFF.md - current state + backlog

Running backlog for the Balboa website. Replaces the old versioned
`balboa-handoff-vX_X.md` docs (last one was v0.7, plus the v1.0 chat sessions).
Update this file in the same commit as the work. Newest notes on top.

## State as of 2026-10-31 (repo audit at the move to Claude Code)

Verified by reading the repo (`main` @ `ae3a51f`) and the live site.

**Live and working**
- Site live at https://balboa-afrojazz.com (apex + www), HTTPS forced.
- `index.html` is the v1.0 content: 7 videos (Story, Boda Boda, Carolina, Firebon,
  Transcendence (Bosnia), Jazz in Catstown, Isolation Sessions #85), brand-colored hero
  socials, Bandcamp player, Shows, Contact form.
- Contact form posts to `/api/contact`; `src/index.js` sends it via Email Routing.
- `sitemap.xml` + `robots.txt` live. Google Search Console set up under the band Google
  account. DMARC per Tugan at `p=quarantine`, SPF + DKIM on.

**Not what we thought (found in the audit)**
- **Turnstile is NOT live.** The Turnstile-verifying Worker was uploaded to the repo
  root as `index.js` (2026-06-30) instead of `src/index.js`. `wrangler.jsonc` deploys
  `src/index.js`, which has no Turnstile. `index.html` has no widget either.
- **Honeypot is front-end only.** `index.html` sends the hidden `website` field, but
  neither Worker version checks it. So bots are currently not filtered at all.
- **Security headers are not in either Worker.** They may be set in the Cloudflare
  dashboard (Transform Rules) or not at all. Needs a check in DevTools.
- **Stray root `index.js` is publicly served** at `/index.js` (not in `.assetsignore`).
  No secrets in it, but it's clutter and confusing.
- Repo is **Public** (old notes said private). Decision pending.
- Stale branch `cloudflare/workers-autoconfig` (auto-created by Cloudflare, 4 months old).
- `README.md` is still the empty "Initial commit" placeholder.

## Backlog (in order)

1. **Contact form protection, done properly** (one commit, ships together):
   - Merge Turnstile verification + server-side honeypot check into `src/index.js`.
   - Add the Turnstile widget to the form in `index.html` and send its token as
     `cfToken` in the payload.
   - Delete the root `index.js`.
   - Pre-req (Tugan, dashboard): confirm the Turnstile widget still exists with
     `balboa-afrojazz.com` as hostname, and that `TURNSTILE_SECRET` is set as a Worker
     secret. Site key on record: `0x4AAAAAADtZTNZ-wWx-gqi2` (public by design).
   - Verify: real test message lands in the band inbox; a submission with no token
     is rejected.
   - Trap: the Turnstile Worker rejects any request without a token. Never deploy the
     Worker change without the widget in the HTML, or every real message fails.
2. **Security headers.** Check DevTools > Network > document > Response Headers on the
   live site. If missing, add them in the Worker (wrap the `ASSETS.fetch` response).
3. **Repo visibility** decision (public vs private). GitHub settings, Tugan's call.
4. Delete branch `cloudflare/workers-autoconfig`.
5. **Successor README** (`README.md`): what the site is, how to edit shows/videos, how
   deploy works, which accounts own what (GitHub org, Cloudflare, Search Console, all on
   the band hotmail), where secrets live.
6. Optional: `/update-shows` custom command in `.claude/commands/`.

## Parked / later
- No-code CMS (Sveltia vs Decap). Sveltia 1.0 slipped to late 2026. Content is baked
  into `index.html`, so this needs restructuring first.
- Rate-limit rule on `/api/contact`: deliberately skipped for now (single locked inbox,
  low risk). Revisit if spam shows up after Turnstile.
- DMARC: keep an eye on aggregate reports / deliverability.
- Transparent logo asset (`balboa.jpg` has a baked background); nav logo crop.
- Proper favicon (currently inline-SVG orange "B").
- Unused `--plinth` CSS variable (harmless).
- About photo shows fewer people than the roster; trumpet seat still open.

## Facts
- EP "In the Ghetto", released 1 May 2024, 6 tracks, Daltoon Studio, Eindhoven.
  Bandcamp album id `3631149298`.
- Lineup: Rob Vermaelen (Rap/MC), Marco Krijger (Hammond), Kenneth a Joe Liauw (Drums),
  Joost van Loon (Guitar), Tugan Turgut (Bass), Onno Buijs (Sax), Christophe Millet
  (Percussion), Trumpet seat open.
- Accounts: GitHub org `Balboa-AfroJazz`, Cloudflare, and Google Search Console all on
  `balboaafrojazz@hotmail.com`. Public contact address: `hello@balboa-afrojazz.com`.
- Domain via Cloudflare Registrar (~EUR 10/yr, the only recurring cost).

## Links
- Live: https://balboa-afrojazz.com
- Repo: https://github.com/Balboa-AfroJazz/website
- Bandcamp: https://balboa-afrojazz.bandcamp.com/album/in-the-ghetto
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/
- Turnstile server-side validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Workers Builds: https://developers.cloudflare.com/workers/ci-cd/builds/
- Workers static assets: https://developers.cloudflare.com/workers/static-assets/
- Send email from Workers: https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/
- Google Search Console: https://search.google.com/search-console
