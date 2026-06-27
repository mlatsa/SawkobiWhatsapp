// =========================================================================
//  WhatsApp after-hours bot - Official Cloud API (webhook) version
//
//  Meta calls the GET /webhook route once, to verify you own this server.
//  After that, every incoming WhatsApp message gets POSTed to /webhook.
//  This code checks if it's outside business hours and, if so, replies
//  automatically using Meta's Graph API. During business hours it stays
//  quiet (unless the message matches an FAQ keyword in config.js).
// =========================================================================

const express = require('express');
const config = require('./config');

const {
  WHATSAPP_TOKEN, // access token from API Setup (temporary) or System User (permanent)
  PHONE_NUMBER_ID, // "Phone number ID" shown on the API Setup screen
  VERIFY_TOKEN, // any string you make up - must match what you type in the Meta dashboard
  PORT = 3000,
  GRAPH_API_VERSION = 'v23.0',
} = process.env;

if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID || !VERIFY_TOKEN) {
  console.warn(
    '⚠️  Missing WHATSAPP_TOKEN, PHONE_NUMBER_ID, or VERIFY_TOKEN environment variables. ' +
      'The server will run, but webhook verification and sending replies will fail until these are set.'
  );
}

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('WhatsApp after-hours bot is running.'));

// ---- Step A: Meta calls this once, when you click "Verify and save" -------
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified by Meta.');
    return res.status(200).send(challenge);
  }
  console.log('❌ Webhook verification failed (token mismatch).');
  return res.sendStatus(403);
});

// ---- Step B: Meta POSTs every incoming message/status update here ---------
const processedMessageIds = new Set(); // avoid double-replying if Meta resends an event
const lastAwayReplyAt = new Map(); // jid -> last time we sent the away message

app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // acknowledge immediately - Meta expects a fast response

  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const messages = value?.messages;
    if (!messages || messages.length === 0) return; // delivery/read receipts etc. - nothing to reply to

    for (const msg of messages) {
      if (processedMessageIds.has(msg.id)) continue;
      processedMessageIds.add(msg.id);
      await handleMessage(msg);
    }
  } catch (err) {
    console.error('Error processing webhook payload:', err);
  }
});

async function handleMessage(msg) {
  const from = msg.from; // sender's WhatsApp number, e.g. "393331234567"
  const text = msg.text?.body || '';
  if (!from) return;

  // FAQ answers always fire, any time of day, if configured.
  const faqAnswer = matchFaq(text);
  if (faqAnswer) {
    await sendMessage(from, faqAnswer);
    return;
  }

  if (isWeekend()) {
    if (!canSendAway(from)) return;
    await sendMessage(from, config.weekendMessage);
    return;
  }

  if (isWithinBusinessHours()) {
    return; // inside business hours - let a human reply, bot stays quiet
  }

  if (!canSendAway(from)) return; // already sent the away message recently to this person

  await sendMessage(from, config.awayMessage);
}

function matchFaq(text) {
  const lower = text.toLowerCase();
  for (const entry of config.faq || []) {
    if (entry.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return entry.reply;
    }
  }
  return null;
}

function canSendAway(jid) {
  const now = Date.now();
  const last = lastAwayReplyAt.get(jid);
  if (last && now - last < config.cooldownMinutes * 60 * 1000) return false;
  lastAwayReplyAt.set(jid, now);
  return true;
}

function getLocalTimeInfo(timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find((p) => p.type === 'weekday').value.toLowerCase(); // 'mon', 'tue', ...
  let hour = parseInt(parts.find((p) => p.type === 'hour').value, 10);
  if (hour === 24) hour = 0;
  return { weekday, hour };
}

function isWithinBusinessHours() {
  const { weekday, hour } = getLocalTimeInfo(config.timezone);
  const todayRange = config.businessHours[weekday];
  if (!todayRange) return false;
  return hour >= todayRange.open && hour < todayRange.close;
}

function isWeekend() {
  const { weekday } = getLocalTimeInfo(config.timezone);
  return (config.weekendDays || []).includes(weekday);
}

async function sendMessage(to, text) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error('Send message failed:', res.status, errBody);
    } else {
      console.log(`Sent reply to ${to}`);
    }
  } catch (err) {
    console.error('Network error sending message:', err?.message || err);
  }
}

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
