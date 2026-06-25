// =========================================================================
//  EDIT THIS FILE to change your hours and what the bot says.
//  Save and redeploy (or restart) for changes to take effect.
// =========================================================================

module.exports = {
  // Your timezone. Find yours at https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  timezone: 'Europe/Rome',

  // Your opening hours, 24-hour format. Set a day to `null` if closed all day.
  businessHours: {
    mon: { open: 9, close: 18 },
    tue: { open: 9, close: 18 },
    wed: { open: 9, close: 18 },
    thu: { open: 9, close: 18 },
    fri: { open: 9, close: 18 },
    sat: null,
    sun: null,
  },

  // Sent automatically when someone messages you OUTSIDE the hours above.
  // During business hours, the bot stays silent and lets your team reply -
  // unless the message matches an FAQ keyword below, which always answers.
  awayMessage:
    "Thanks for reaching out! We're currently outside business hours (Mon–Fri, 9am–6pm, Rome time). We'll get back to you as soon as we're back. 🙏",

  // Don't repeat the away message to the SAME person more than once every
  // this-many minutes, so a back-and-forth conversation at 11pm doesn't get
  // the away message after every single line they send.
  cooldownMinutes: 180, // 3 hours

  // OPTIONAL: keyword-based FAQ answers that fire ANY time, day or night,
  // before the away-message logic even runs. Leave the array empty ( [] )
  // if you just want the after-hours message for now - you can add these
  // later without touching anything else.
  faq: [
    // {
    //   keywords: ['hours', 'open', 'orari', 'aperto'],
    //   reply: "We're open Monday to Friday, 9am-6pm (Rome time).",
    // },
  ],
};
