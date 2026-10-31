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
- Contact form protection: Turnstile widget (loads when Contact opens) plus a server-side
  honeypot. Needs the `TURNSTILE_SECRET` Worker secret, or every real message fails.
- Security headers set in `_headers` (no CSP, deliberately: the inline script would force
  `'unsafe-inline'`, and the site renders no user content).
- `sitemap.xml` + `robots.txt` live. Google Search Console set up under the band Google
  account. DMARC per Tugan at `p=quarantine`, SPF + DKIM on.

**Not what we thought (found in the audit)**
- Repo is **Public** (old notes said private). Decision pending.
- `README.md` is still the empty "Initial commit" placeholder.

## Backlog (in order)

1. **Repo visibility** decision (public vs private). GitHub settings, Tugan's call.
2. Optional: `/update-shows` custom command in `.claude/commands/`.

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
