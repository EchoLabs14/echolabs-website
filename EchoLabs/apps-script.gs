/* ============================================================
   ECHOLABS — GOOGLE APPS SCRIPT LEAD ENDPOINT
   ------------------------------------------------------------
   On each website form submission this script:
     1. Appends a row to the correct Google Sheet, routed by the
        "Creator or Brand?" field:
          • "Brand"   -> BRAND sheet  (Leads from brands)
          • "Creator" -> CREATOR sheet (Leads or Inquiries)
     2. Sends an automated thank-you email to the lead, from the
        Google account that owns this script, including your
        Calendly link to book a discovery call.

   IMPORTANT — so the email comes FROM office@echolabs.net.in:
   create & deploy this script while signed in to the
   office@echolabs.net.in Google account. MailApp sends from the
   owning account. (If you must run it from another account, add
   office@echolabs.net.in as a verified "Send mail as" alias in
   that Gmail account and switch MailApp below to GmailApp with
   a `from` option.)

   Setup steps are in README.md.
   ============================================================ */

/* ---------- CONFIG (edit these) ---------- */

// The two spreadsheets (the ID is the long string in each sheet's URL).
var SHEETS = {
  brand:   '17IAYzZJnjB4TEWMoTJAOrkEYSZHOoTFBFEpfMylYv9M',   // "Leads from brands"
  creator: '1FcjNPJu12mSf71xqQ29HiHRqyenzhyMR3q-sGiagCg4'    // "Leads or Inquiries"
};

// Your Calendly link — included as the "book a call" button in the thank-you email.
var CALENDLY_URL = 'https://calendly.com/office-echolabs/30min';

// Branding used in the email.
var BRAND_NAME   = 'EchoLabs';
var REPLY_TO     = 'office@echolabs.net.in';

var HEADERS = ['Timestamp', 'Type', 'Name', 'Company', 'Phone', 'Email', 'Message', 'Source'];

/* ---------- ENTRY POINTS ---------- */

function doPost(e) {
  var data = {};
  try {
    data = parseBody(e);

    // Route by the "type" field. Anything containing "creator" -> creator sheet.
    var isCreator = String(data.type || '').toLowerCase().indexOf('creator') > -1;
    var sheetId   = isCreator ? SHEETS.creator : SHEETS.brand;

    // Write the row. If the sheet is bad/inaccessible, don't lose the lead —
    // log it and email the raw details to the operator instead.
    try {
      var sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
      if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
      sheet.appendRow([
        new Date(),
        data.type    || '',
        data.name    || '',
        data.company || '',
        data.phone   || '',
        data.email   || '',
        data.message || '',
        data.source  || ''
      ]);
    } catch (sheetErr) {
      Logger.log('SHEET_WRITE_FAILED (type=' + data.type + '): ' + sheetErr);
      notifyOperator(data, sheetErr);
    }

    // Fire the thank-you email (never let an email failure break the capture).
    try { sendThankYou(data, isCreator); } catch (mailErr) { Logger.log('Mail error: ' + mailErr); }

    return json({ result: 'success' });
  } catch (err) {
    Logger.log('LEAD_CAPTURE_ERROR: ' + err);
    try { notifyOperator(data, err); } catch (ignore) {}
    return json({ result: 'error', error: 'capture_failed' });
  }
}

// Health check — opening the /exec URL in a browser returns this.
function doGet() {
  return json({ status: 'EchoLabs lead endpoint is live' });
}

/* ---------- THANK-YOU EMAIL ---------- */

function sendThankYou(data, isCreator) {
  var to = String(data.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(to)) return;   // no/invalid email -> skip
  if (MailApp.getRemainingDailyQuota() <= 0) { Logger.log('Email quota exhausted; skipped: ' + to); return; }

  var firstName = String(data.name || '').trim().split(/\s+/)[0] || 'there';
  var subject   = 'Thanks for reaching out to ' + BRAND_NAME;

  var intro = isCreator
    ? "Thanks for your interest in joining the " + BRAND_NAME + " Creator Network. We review every application personally, and our team will be in touch soon."
    : "Thanks for reaching out to " + BRAND_NAME + ". We've received your details and our team will get in touch with you shortly.";

  var htmlBody =
    '<div style="margin:0;padding:0;background:#F3F0E8;">' +
      '<div style="max-width:560px;margin:0 auto;padding:40px 28px;font-family:Arial,Helvetica,sans-serif;color:#121110;">' +
        '<div style="font-size:20px;font-weight:800;letter-spacing:-.02em;text-transform:uppercase;">' + BRAND_NAME + '</div>' +
        '<div style="height:4px;width:64px;margin:14px 0 28px;background:linear-gradient(90deg,#FF4A24,#7B3DFF 55%,#3A2BE8);border-radius:4px;"></div>' +
        '<p style="font-size:18px;line-height:1.5;margin:0 0 16px;">Hi ' + escapeHtml(firstName) + ',</p>' +
        '<p style="font-size:16px;line-height:1.6;color:#3a3833;margin:0 0 22px;">' + intro + '</p>' +
        '<p style="font-size:16px;line-height:1.6;color:#3a3833;margin:0 0 28px;">Want to move faster? Grab a time that works for you and let’s talk through your one idea — and the echoes it could become.</p>' +
        '<a href="' + CALENDLY_URL + '" style="display:inline-block;background:#121110;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:15px 26px;border-radius:100px;">Book a discovery call &rarr;</a>' +
        '<p style="font-size:13px;line-height:1.6;color:#6E6A60;margin:30px 0 0;">Or reply directly to this email — it reaches us at ' + REPLY_TO + '.</p>' +
        '<p style="font-size:13px;line-height:1.6;color:#6E6A60;margin:22px 0 0;">— The ' + BRAND_NAME + ' team</p>' +
        '<div style="margin-top:28px;padding-top:18px;border-top:1px solid #E0DBCF;font-size:12px;color:#9a958a;">' + BRAND_NAME + ' — a content-first growth partner. The creator is not the strategy. The content is.</div>' +
      '</div>' +
    '</div>';

  var plain =
    'Hi ' + firstName + ',\n\n' + intro + '\n\n' +
    'Book a discovery call: ' + CALENDLY_URL + '\n\n' +
    'Or just reply to this email (' + REPLY_TO + ').\n\n— The ' + BRAND_NAME + ' team';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: plain,
    htmlBody: htmlBody,
    name: BRAND_NAME,
    replyTo: REPLY_TO
  });
}

/* ---------- OPERATOR ALERT (lead never lost) ---------- */

// If a sheet write fails, email the raw lead to the operator so it isn't lost.
function notifyOperator(data, err) {
  try {
    if (MailApp.getRemainingDailyQuota() <= 0) { Logger.log('Quota exhausted; operator alert skipped'); return; }
    MailApp.sendEmail({
      to: REPLY_TO,
      subject: '[EchoLabs] Lead capture FAILED — saved here instead',
      name: BRAND_NAME,
      body:
        'A form submission could not be written to the sheet. Details below.\n\n' +
        'Type: '    + (data.type    || '') + '\n' +
        'Name: '    + (data.name    || '') + '\n' +
        'Company: ' + (data.company || '') + '\n' +
        'Phone: '   + (data.phone   || '') + '\n' +
        'Email: '   + (data.email   || '') + '\n' +
        'Message: ' + (data.message || '') + '\n' +
        'Source: '  + (data.source  || '') + '\n\n' +
        'Error: '   + err
    });
  } catch (mailErr) {
    Logger.log('OPERATOR_ALERT_FAILED: ' + mailErr);
  }
}

/* ---------- HELPERS ---------- */

function parseBody(e) {
  if (e && e.parameter && Object.keys(e.parameter).length) return e.parameter;  // form-encoded
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (ignore) {}
  }
  return {};
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
