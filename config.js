// =========================================================================
//  EDIT THIS FILE to change your hours and what the bot says.
//  Save and redeploy (or restart) for changes to take effect.
// =========================================================================

module.exports = {
  // Your timezone. Find yours at https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  timezone: 'Asia/Tbilisi',

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

  // Sent automatically when someone messages you OUTSIDE the hours above,
  // on a WEEKDAY. During business hours, the bot stays silent and lets your
  // team reply - unless the message matches an FAQ keyword below, which
  // always answers.
  awayMessage: `გამარჯობა! 👋

მადლობას გიხდით, რომ დაგვიკავშირდით.😊
თქვენი შეტყობინება ჩვენი სამუშაო საათების დასრულების შემდეგ მივიღეთ. ამ დროისთვის ჩვენი გუნდი აღარ მუშაობს, თუმცა დილით პირველივე შესაძლებლობისთანავე გავეცნობით თქვენს შეტყობინებას.

თუ წინასწარ მოგვწერთ, რომელ საათზე გირჩევნიათ საუბარი, დაგიკავშირდებით თქვენთვის ყველაზე მოსახერხებელ დროს.

გმადლობთ გაგებისა და ნდობისთვის. სასიამოვნო საღამოს გისურვებთ! ❤️`,

  // Sent any time during the WEEKEND (Saturday or Sunday) instead of the
  // awayMessage above, since weekends are closed all day in businessHours.
  weekendMessage: `გამარჯობა! 👋

მადლობა, რომ მოგვწერეთ.

დღეს ჩვენი გუნდის დასვენების დღეა, ამიტომ პასუხს ორშაბათს, სამუშაო საათებში დაგიბრუნებთ 😊

თუ მოგვწერთ, რომელ საათზე იქნება თქვენთვის მოსახერხებელი საუბარი, სწორედ იმ დროს დაგიკავშირდებით.

გმადლობთ გაგებისთვის! ❤️ სასიამოვნო დასვენების დღეს გისურვებთ!`,

  // Which weekday keys count as "the weekend" for picking weekendMessage
  // instead of awayMessage. Change this if your weekend falls on different days.
  weekendDays: ['sat', 'sun'],

  // Don't repeat the away/weekend message to the SAME person more than once
  // every this-many minutes, so a back-and-forth conversation at 11pm doesn't
  // get the away message after every single line they send.
  cooldownMinutes: 180, // 3 hours

  // OPTIONAL: keyword-based FAQ answers that fire ANY time, day or night,
  // before the away/weekend logic even runs. Leave the array empty ( [] )
  // if you just want the two messages above for now.
  faq: [
    // {
    //   keywords: ['ფასი', 'საათები'],
    //   reply: 'ჩვენ ვმუშაობთ ორშაბათ-პარასკევს, 9:00-დან 18:00 საათამდე.',
    // },
  ],
};
