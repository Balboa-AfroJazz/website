// Balboa - Afrojazz site Worker.
// Serves the static site, and handles the contact form at POST /api/contact
// by sending the message to the band inbox via Cloudflare Email Routing.
// No npm dependencies: the email is built as a raw MIME string by hand.

import { EmailMessage } from "cloudflare:email";

const FROM = "hello@balboa-afrojazz.com";        // must be a custom address on the domain
const TO   = "balboaafrojazz@hotmail.com";       // must be a VERIFIED destination address

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }

    // Everything else is the static site (index.html, images, etc.)
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  try {
    const data = await request.json();

    // --- Turnstile: verify the token before doing anything else. ---
    // A real human gets a valid token from the widget; bots without one are
    // rejected here, so no email is sent.
    const verified = await verifyTurnstile(
      data.cfToken,
      request.headers.get("CF-Connecting-IP"),
      env
    );
    if (!verified) {
      return json({ ok: false, error: "Verification failed" }, 403);
    }

    // Strip CR/LF from header fields to prevent header injection.
    const clean = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").trim();
    const name    = clean(data.name).slice(0, 120);
    const email   = clean(data.email).slice(0, 160);
    const message = String(data.message ?? "").slice(0, 5000);

    if (!name || !email || !message) {
      return json({ ok: false, error: "Missing fields" }, 400);
    }

    const raw = [
      `From: Balboa Website <${FROM}>`,
      `To: ${TO}`,
      `Reply-To: ${email}`,
      `Subject: Website enquiry from ${name}`,
      `Message-ID: <${crypto.randomUUID()}@balboa-afrojazz.com>`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset="utf-8"`,
      ``,
      `Name:  ${name}`,
      `Email: ${email}`,
      ``,
      message,
      ``,
    ].join("\r\n");

    const msg = new EmailMessage(FROM, TO, raw);
    await env.EMAIL.send(msg);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "Send failed" }, 500);
  }
}

// Validate a Turnstile token against Cloudflare's Siteverify API.
// Returns true only on a genuine pass. Uses the TURNSTILE_SECRET Worker secret.
async function verifyTurnstile(token, ip, env) {
  if (!token) return false;
  const form = new URLSearchParams();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const resp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  );
  const outcome = await resp.json();
  return outcome.success === true;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
