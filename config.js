// =========================================================================
//  EDIT THIS FILE to customize what your bot says. No coding needed beyond
//  changing the text between quotes "..." below. Save the file and restart
//  the bot (or just redeploy) for changes to take effect.
// =========================================================================

module.exports = {
  // Your timezone, used to work out "business hours". Find yours at
  // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  timezone: 'Europe/Rome',

  // Your opening hours, in 24-hour format. Set a day to `null` if you're
  // closed all day (see "sat" and "sun" below).
  businessHours: {
    mon: { open: 9, close: 18 },
    tue: { open: 9, close: 18 },
    wed: { open: 9, close: 18 },
    thu: { open: 9, close: 18 },
    fri: { open: 9, close: 18 },
    sat: null,
    sun: null,
  },

  // Sent once per contact every `greetingCooldownMinutes` when they message
  // you for the first time in a while. Set to '' (empty string) to disable.
  greetingMessage:
    "Hi! 👋 Thanks for messaging us. This is an automated assistant — a real person will follow up too.",
  greetingCooldownMinutes: 720, // 12 hours

  // FAQ replies. The bot checks these IN ORDER and replies with the first
  // one whose keyword appears anywhere in the client's message (not
  // case-sensitive). Add, remove, or edit entries freely.
  faq: [
    {
      keywords: ['price', 'cost', 'how much', 'prezzo', 'costo', 'quanto'],
      reply:
        'Our prices depend on what you need — could you tell us a bit more? A team member will send you a quote.',
    },
    {
      keywords: ['hours', 'open', 'orari', 'aperto', 'orario'],
      reply: "We're open Monday to Friday, 9am–6pm (Rome time). Closed weekends.",
    },
    {
      keywords: ['address', 'location', 'where are you', 'dove siete', 'indirizzo'],
      reply: 'Here you can find us: [add your address or Google Maps link here]',
    },
    // Add more like this:
    // {
    //   keywords: ['refund', 'cancel', 'rimborso'],
    //   reply: 'For cancellations or refunds, please tell us your order number and we\'ll take care of it.',
    // },
  ],

  // Sent when the message doesn't match any FAQ above AND it's currently
  // within business hours.
  defaultReply:
    "Thanks for your message! We'll get back to you shortly. In the meantime, feel free to ask about our hours, pricing, or location.",

  // Sent when the message doesn't match any FAQ above AND it's a WEEKDAY
  // but outside the hours set above (e.g. a Tuesday night).
  awayMessage:
    "Thanks for reaching out! We're currently outside business hours (Mon–Fri, 9am–6pm). We'll reply as soon as we're back. 🙏",

  // Sent when the message doesn't match any FAQ above AND it's a WEEKEND
  // day (Saturday or Sunday) - sent any time during the weekend, since
  // weekends are closed all day in businessHours above.
  weekendMessage:
    "Thanks for messaging us! We're closed for the weekend and will be back Monday morning. We'll get back to you then. 🙏",

  // Which weekday keys (from businessHours above) count as "the weekend"
  // for picking weekendMessage instead of awayMessage. Matches sat/sun by
  // default - change this if your weekend falls on different days.
  weekendDays: ['sat', 'sun'],

  // How long (in minutes) the bot waits before sending another
  // default/away reply to the SAME person, so it doesn't repeat itself on
  // every single message in a back-and-forth conversation. FAQ answers are
  // NOT affected by this — those are always answered.
  cooldownMinutes: 60,

  // Only reply in 1-on-1 chats, never in WhatsApp groups. Leave this as
  // true unless you specifically want the bot active in groups too.
  ignoreGroups: true,
};
