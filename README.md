# WhatsApp After-Hours Bot (Official Cloud API)

Replies automatically ONLY when someone messages you outside business
hours. During business hours it stays silent so your team can answer
personally. (You can optionally add instant FAQ answers later in
`config.js` — see the comments in that file.)

This uses Meta's official Cloud API — no ban risk, no QR codes — but it
does require the payment method on the WhatsApp Business Account that we
talked about, and a tiny bit more setup than the WhatsApp-Web version.

---

## You need 4 values before this works

| Value | Where to find it |
|---|---|
| `PHONE_NUMBER_ID` | App dashboard → **Step 1. Try it out** (API Setup) |
| `WHATSAPP_TOKEN` | Same screen — "Temporary access token" (fine for testing; swap for a permanent System User token later) |
| `VERIFY_TOKEN` | **You make this up.** Any string, e.g. `sawkobi-secret-2026`. You'll type the exact same thing into the Meta dashboard. |
| A public HTTPS URL for this code | See Part A or B below |

---

## Part A — Test it live in the next 10 minutes (on your laptop, via ngrok)

This is the fastest way to see it actually working today, before you set
up permanent hosting.

1. Install dependencies and run it locally:
   ```bash
   npm install
   WHATSAPP_TOKEN=your_token PHONE_NUMBER_ID=your_id VERIFY_TOKEN=sawkobi-secret-2026 npm start
   ```
2. In a **second terminal**, install and run [ngrok](https://ngrok.com)
   (free, no card needed for this):
   ```bash
   ngrok http 3000
   ```
   It'll print something like `https://abc123.ngrok-free.app` — that's
   your public URL, free and stable for as long as you keep it running.
3. Back on the **"Configure Webhooks"** page you're on right now:
   - **Callback URL:** `https://abc123.ngrok-free.app/webhook` (your ngrok URL + `/webhook`)
   - **Verify token:** `sawkobi-secret-2026` (must match exactly what you used above)
   - Click **Verify and save**. You should see `✅ Webhook verified by Meta.` in your terminal.
4. There's usually a **"Manage"** link or a field list right after saving —
   make sure **`messages`** is subscribed/checked. That's the event type
   that tells your bot when someone texts you.
5. Send a WhatsApp message to your test number from your own phone (the
   number you added as a test recipient back in Step 1).

**If nothing happens:** the banner on your screen says real messages won't
reach the webhook while the app is **Unpublished**. If step 5 doesn't
trigger anything in your terminal, go to **Publish** in the left sidebar
and publish the app — your earlier checklist looked complete, so this
should just be a click, not a review wait. Then try sending the message again.

To actually see the after-hours reply fire on demand, temporarily edit
`config.js` and set today's day to `null` (closed), save, restart `npm
start`, send a message, then change it back.

---

## Part B — Make it permanent (free, not on your device)

Once Part A proves the logic works, move it off your laptop:

1. Push this folder to a free host that doesn't sleep on inbound HTTP
   the way ours needs — **Render** is the easiest free, no-card option:
   - Create a free account at render.com
   - New → Web Service → connect this code (via a GitHub repo, or Render's manual upload)
   - Build command: `npm install` — Start command: `npm start`
   - Add the same 3 environment variables (`WHATSAPP_TOKEN`,
     `PHONE_NUMBER_ID`, `VERIFY_TOKEN`) under the service's **Environment** tab
2. Render gives you a permanent URL like `https://sawkobi-bot.onrender.com`
3. Go back to **Configure Webhooks** and update the **Callback URL** to
   `https://sawkobi-bot.onrender.com/webhook`, click **Verify and save** again.
4. Done — ngrok/your laptop are no longer involved.

(Want me to walk through the GitHub + Render steps in detail when you get there? Just say so.)

---

## Customizing what it says

Open `config.js`. Change the hours, the away message text, or add FAQ
keyword/answer pairs — every option has a comment explaining it. Restart
(or redeploy) after saving.

## Files

- `index.js` — webhook server (you shouldn't need to edit this)
- `config.js` — **edit this** for hours and messages
- `package.json` — dependencies
- `.env.example` — copy to `.env` for local runs, or set these in your host's dashboard
