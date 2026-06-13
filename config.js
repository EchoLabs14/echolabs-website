/* ============================================================
   ECHOLABS — SITE CONFIG
   ------------------------------------------------------------
   This is the ONLY website file you need to edit to go live.
   (The thank-you email's Calendly link is set separately inside
   apps-script.gs — see README.md.)
   ============================================================ */
window.ECHO_CONFIG = {

  /* 1) Your Calendly scheduling link.
        Every "Book a discovery call" button REDIRECTS here
        (opens in a new tab). No Calendly UI is embedded on the site.
        Example: "https://calendly.com/echolabs/discovery"          */
  CALENDLY_URL: "https://calendly.com/office-echolabs/30min",

  /* 2) Your Google Apps Script Web App URL (from deploying
        apps-script.gs — see README.md). Looks like:
        "https://script.google.com/macros/s/AKfycb..../exec"
        Until set, forms fall back to opening email.               */
  FORM_ENDPOINT: "https://script.google.com/macros/s/AKfycbwm0raa8sl9ioAw4z8pPoSPn5VjxZ4_cDmYfE0noXLJde4-6qw6GW7U4uFeNClPHtAL6g/exec",

  /* 3) Contact email — used by all "Email us" buttons.            */
  EMAIL: "office@echolabs.net.in",

  /* 4) WhatsApp click-to-chat.
        `number` is full international format, digits only
        (91 = India country code + the 10-digit number).
        `message` is pre-filled into the chat — edit freely.       */
  WHATSAPP: {
    number: "919829041767",
    message: "Hey EchoLabs 👋 saw your site — let's talk content.",
  },

  /* 5) Social links. Leave "" to hide an icon's destination
        (the icon stays but is disabled until you add a URL).      */
  SOCIAL: {
    linkedin:  "",   // <-- paste your LinkedIn URL
    instagram: "",   // <-- paste your Instagram URL
  },

  /* 6) WORK PAGE — optional video case studies.
        Each: { title, embed } where `embed` is a YouTube/Vimeo
        EMBED url or a direct .mp4. Leave empty to hide the section
        (the "Our Work" deck mockup shows regardless).             */
  VIDEOS: [
    // { title: "Founder-led launch — 2.4M views", embed: "https://www.youtube.com/embed/XXXXXXXXXXX" },
  ],
};
