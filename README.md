# WhatsApp Auto-Reply Bot (free, no official API)

A simple bot that replies to your clients automatically: FAQ answers,
business-hours awareness, and an away message. It connects to WhatsApp the
same way "WhatsApp Web" does — no Meta Business account, no API approval,
no credit card, ever.

**Edit `config.js` to change what it says.** Everything else in this folder
you can mostly leave alone.

---

## ⚠️ Please read before you start

This connects using **Baileys**, a community library that talks to WhatsApp
the same way the official WhatsApp Web site does. It is not the official
API, and using it technically goes against WhatsApp's Terms of Service.
In practice:

- For a low-volume bot just replying to people who message *you* first,
  the risk is real but lower than for cold outreach or bulk messaging.
- There is no guaranteed-safe setting. Numbers occasionally get
  temporarily or permanently restricted, sometimes for no obvious reason.
- **Don't use your only personal number if losing WhatsApp access for a
  while would be a real problem.** A secondary SIM/number is safer if you
  can get one.
- Never use this to message people who haven't messaged you, or to send
  bulk/marketing messages — that's the behavior most likely to get flagged.

If that risk isn't acceptable for your business, the alternative is Meta's
official WhatsApp Business API — but note it requires adding a card to
your Meta Business account before you can use a real phone number, even
though replies to clients who message first are free.

---

## 1. Run it locally first (to make sure it works)

You'll need [Node.js](https://nodejs.org) 18 or newer installed.

```bash
npm install
npm start
```

A QR code will print in your terminal. Open WhatsApp on your phone →
**Settings (or ⋮) → Linked Devices → Link a Device**, and scan it.

Prefer typing a code instead of scanning? Set an environment variable
with your number (digits only, with country code, no `+`) before starting:

```bash
# Mac/Linux
PAIRING_PHONE_NUMBER=393331234567 npm start

# Windows (PowerShell)
$env:PAIRING_PHONE_NUMBER="393331234567"; npm start
```

You'll get a short code to enter under **Linked Devices → Link with phone
number** instead of scanning anything.

Once connected, send a message to that WhatsApp number from a different
phone to test the auto-replies.

A folder called `auth_info_baileys/` will appear — this holds your login
session so you don't have to re-scan every time you restart. **Treat it
like a password: anyone with this folder can access that WhatsApp
account.** Never share it or commit it to a public GitHub repo (it's
already excluded via `.gitignore`).

---

## 2. Hosting it "somewhere else", for free, running all the time

This is the honest part: nothing perfectly satisfies "always-on, free, and
no card" at the same time for a bot that needs a constant connection.
Something has to flex. Here are your realistic options, best fit first
for what you asked for:

### Option A — A free container host with a keep-alive ping (recommended)
Platforms like Render, SnapDeploy, or Replit let you deploy this for free
with no credit card. The catch: they "sleep" your app after a period with
no incoming web traffic, which would drop the WhatsApp connection.

The fix: this bot already runs a tiny web server (the "keep-alive"
server in `index.js`) just so an external pinger can hit it every few
minutes and stop the host from sleeping. Pair your host with a free
uptime monitor like **cron-job.org** or **UptimeRobot** (both free, no
card) pointed at your app's URL, checking every 5–10 minutes.

Honest limits: occasional restarts still happen (deploys, host
maintenance), and if the host's storage isn't persistent, the
`auth_info_baileys` folder may get wiped on restart — meaning you'll need
to scan the QR code again. Check whether your chosen host's free tier
offers a persistent disk/volume; if it does, point it at this project's
folder so the session survives restarts.

### Option B — A small "always-on" free bot-hosting panel
There are smaller hosting panels (originally built for Discord/game bots)
that advertise genuine 24/7 uptime with no card, since the workload is
lightweight. These can work for a small Node.js process like this one.
Two things to weigh: they're less established than the big-name hosts, and
you'd be trusting them with that `auth_info_baileys` session folder —
i.e., access to your WhatsApp account. Worth it for a low-stakes test
number; I'd be more cautious for a number that matters to your business.

### Option C — A genuinely-always-free cloud VM (needs a card on file)
Oracle Cloud's "Always Free" tier gives you a real, persistent server that
never sleeps and never expires — the most reliable free option overall.
It does require adding a card for identity verification when you sign up,
even though you won't be charged on the free tier. If you're open to that
one-time step (no recurring payment), it's the sturdiest setup here.

---

## 3. Customizing the bot

Open `config.js`. Everything you'd want to change — business hours, the
away message, FAQ keywords and answers — is in plain text with comments
explaining each part. Save the file and restart the bot for changes to
apply.

## 4. Files in this folder

- `index.js` — the bot logic (you shouldn't need to touch this)
- `config.js` — **edit this** to change hours, FAQs, and messages
- `package.json` — dependency list
- `auth_info_baileys/` — created after you link WhatsApp; your session, keep it private
