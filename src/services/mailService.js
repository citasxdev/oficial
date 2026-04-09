const nodemailer = require('nodemailer');

let cachedTransporter = null;

function isMailConfigured() {
  return Boolean(
    (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ||
      (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  );
}

function buildTransporter() {
  if (!isMailConfigured()) {
    throw new Error('La integración de correo no está configurada.');
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = buildTransporter();
  }
  return cachedTransporter;
}

async function sendProfileByEmail({ to, subject, text, filename, content }) {
  const recipients = Array.isArray(to) ? to : [to];
  const transporter = getTransporter();

  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER,
    to: recipients.join(', '),
    subject,
    text,
    attachments: [
      {
        filename,
        content,
        contentType: 'application/xml',
      },
    ],
  });
}

module.exports = {
  isMailConfigured,
  sendProfileByEmail,
};
