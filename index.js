// =========================================================================
//  WhatsApp auto-reply bot
//  - Connects to WhatsApp the same way "WhatsApp Web" does (scan a QR code,
//    or use a pairing code instead - see README.md). No Meta Business
//    account, no API approval, no payment method, ever.
//  - Replies to FAQs, sends a fixed "away" message outside business hours,
//    and an optional one-time greeting. All text is edited in config.js.
//
//  IMPORTANT: this uses an unofficial protocol. Read the README's "Risks"
//  section before pointing this at a number you can't afford to lose.
// =========================================================================

const path = require('path');
const http = require('http');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} = require('@whiskeysockets/baileys');
const qrcodeTerminal = require('qrcode-terminal');

const config = require('./config');

// ---- Optional: connect with a pairing code instead of a QR code ---------
// Set PAIRING_PHONE_NUMBER as an environment variable (digits only, with
// country code, e.g. 393331234567) if you'd rather type a code into
// WhatsApp than scan a QR. Leave it unset to use the QR code method.
const PAIRING_PHONE_NUMBER = process.env.PAIRING_PHONE_NUMBER || null;

const AUTH_FOLDER = path.join(__dirname, 'auth_info_baileys');
const logger = pino({ level: 'silent' });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- Tiny keep-alive web server ------------------------------------------
// Some free hosts spin your app down after a period of HTTP inactivity.
// Point an external uptime monitor (also free) at this URL every few
// minutes to keep the bot's process - and its WhatsApp connection - alive.
// See README.md for recommended free monitors.
const PORT = process.env.PORT || 3000;
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WhatsApp bot is running.\n');
  })
  .listen(PORT, () => {
    console.log(`Keep-alive server listening on port ${PORT}`);
  });

// ---- Business-hours helper -----------------------------------------------
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

// ---- FAQ matching ----------------------------------------------------------
function matchFaq(text) {
  const lower = text.toLowerCase();
  for (const entry of config.faq) {
    if (entry.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return entry.reply;
    }
  }
  return null;
}

// ---- Per-contact cooldowns (in-memory; resets if the bot restarts) -------
const lastSent = new Map(); // key: `${jid}:${kind}` -> timestamp (ms)

function canSend(jid, kind, cooldownMinutes) {
  const key = `${jid}:${kind}`;
  const now = Date.now();
  const last = lastSent.get(key);
  if (last && now - last < cooldownMinutes * 60 * 1000) {
    return false;
  }
  lastSent.set(key, now);
  return true;
}

// ---- Extract plain text from any common message type ----------------------
function extractText(message) {
  if (!message) return '';
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''
  );
}

// ---- Handle one incoming message ------------------------------------------
async function handleMessage(sock, msg) {
  if (!msg.message) return; // reactions, protocol messages, etc. - nothing to reply to
  if (msg.key.fromMe) return; // ignore messages we sent ourselves
  const jid = msg.key.remoteJid;
  if (!jid) return;
  if (jid === 'status@broadcast') return; // ignore status updates
  if (config.ignoreGroups && jid.endsWith('@g.us')) return; // ignore groups

  const text = extractText(msg.message);
  if (!text) return; // media with no caption, etc. - skip for this simple bot

  const greetingText =
    config.greetingMessage && canSend(jid, 'greeting', config.greetingCooldownMinutes)
      ? config.greetingMessage
      : null;

  const faqAnswer = matchFaq(text);
  let replyText = null;
  if (faqAnswer) {
    replyText = faqAnswer; // FAQ answers are always sent, no cooldown
  } else if (canSend(jid, 'fallback', config.cooldownMinutes)) {
    if (isWeekend()) {
      replyText = config.weekendMessage;
    } else if (isWithinBusinessHours()) {
      replyText = config.defaultReply;
    } else {
      replyText = config.awayMessage;
    }
  }

  if (!greetingText && !replyText) return; // everything is on cooldown - stay quiet

  try {
    await sock.sendPresenceUpdate('composing', jid);

    if (greetingText) {
      await delay(900 + Math.random() * 900);
      await sock.sendMessage(jid, { text: greetingText });
    }

    if (replyText) {
      await delay(900 + Math.random() * 1200);
      await sock.sendPresenceUpdate('composing', jid);
      await delay(700 + Math.random() * 900);
      await sock.sendMessage(jid, { text: replyText });
    }

    await sock.sendPresenceUpdate('paused', jid);
  } catch (err) {
    console.error('Failed to send reply:', err?.message || err);
  }
}

// ---- Connect to WhatsApp ----------------------------------------------------
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

  const sock = makeWASocket({
    auth: state,
    logger,
    browser: Browsers.ubuntu('Chrome'),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !PAIRING_PHONE_NUMBER) {
      console.log('\nScan this QR code with WhatsApp > Linked Devices > Link a Device:\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (PAIRING_PHONE_NUMBER && connection === 'connecting' && !sock.authState.creds.registered) {
      try {
        await delay(1500);
        const code = await sock.requestPairingCode(PAIRING_PHONE_NUMBER);
        console.log(
          `\nOpen WhatsApp > Linked Devices > Link with phone number, and enter this code: ${code}\n`
        );
      } catch (err) {
        console.error('Could not request a pairing code:', err?.message || err);
      }
    }

    if (connection === 'open') {
      console.log('✅ Connected to WhatsApp. The bot is now live.');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      const wasRegistered = sock.authState.creds.registered;

      if (loggedOut) {
        console.log(
          '❌ Logged out from WhatsApp. Redeploy (or restart) the service for a clean session and a fresh pairing code.'
        );
      } else if (!wasRegistered) {
        // Disconnected before pairing finished (code expired/unused, etc).
        // Do NOT auto-retry here - repeatedly requesting new pairing codes
        // in a tight loop is what can get the session flagged. Redeploying
        // gives a clean slate and a fresh code instead.
        console.log(
          '⚠️  Disconnected before pairing finished (the code probably wasn\'t entered in time). ' +
            'Redeploy (or restart) the service to get a fresh pairing code, then enter it right away.'
        );
      } else {
        // Was already linked and working - this is a normal drop, safe to reconnect.
        console.log('⚠️  Connection closed, reconnecting in 3 seconds...');
        setTimeout(startBot, 3000);
      }
    }
  });

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      handleMessage(sock, msg).catch((err) =>
        console.error('Error handling message:', err?.message || err)
      );
    }
  });
}

startBot().catch((err) => {
  console.error('Fatal error starting bot:', err);
  process.exit(1);
});
