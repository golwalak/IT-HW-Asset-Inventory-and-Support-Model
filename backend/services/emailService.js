const nodemailer = require('nodemailer');
const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

const MAIL_PROVIDER = (process.env.MAIL_PROVIDER || 'mock').toLowerCase();

function parseBool(v, fallback = false) {
  if (v === undefined) return fallback;
  return String(v).toLowerCase() === 'true';
}

function createSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = parseBool(process.env.SMTP_SECURE, port === 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    throw new Error('SMTP is not configured. Set SMTP_HOST.');
  }

  const config = { host, port, secure };
  if (user && pass) config.auth = { user, pass };

  return nodemailer.createTransport(config);
}

function createGraphClient() {
  const tenantId = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Graph is not configured. Set GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET.');
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      },
    },
  });
}

async function sendMailWithSmtp({ to, cc, subject, text, html }) {
  const transporter = createSmtpTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@sce.com';

  const info = await transporter.sendMail({ from, to, cc, subject, text, html });
  return { provider: 'smtp', messageId: info.messageId || '', accepted: info.accepted || [] };
}

async function sendMailWithGraph({ to, cc, subject, text, html }) {
  const sender = process.env.GRAPH_SENDER_UPN;
  if (!sender) throw new Error('GRAPH_SENDER_UPN is required for Graph sendMail.');

  const client = createGraphClient();

  const msg = {
    subject,
    body: {
      contentType: html ? 'HTML' : 'Text',
      content: html || text,
    },
    toRecipients: (Array.isArray(to) ? to : [to]).filter(Boolean).map((email) => ({
      emailAddress: { address: email },
    })),
    ccRecipients: (Array.isArray(cc) ? cc : [cc]).filter(Boolean).map((email) => ({
      emailAddress: { address: email },
    })),
  };

  await client.api(`/users/${sender}/sendMail`).post({ message: msg, saveToSentItems: true });
  return { provider: 'graph', messageId: '', accepted: msg.toRecipients.map((r) => r.emailAddress.address) };
}

async function sendEmail({ to, cc, subject, text, html }) {
  if (!to || !subject || !(text || html)) {
    throw new Error('Missing required email fields: to, subject, text/html');
  }

  if (MAIL_PROVIDER === 'smtp') {
    return sendMailWithSmtp({ to, cc, subject, text, html });
  }

  if (MAIL_PROVIDER === 'graph') {
    return sendMailWithGraph({ to, cc, subject, text, html });
  }

  // Mock fallback for local demos
  return {
    provider: 'mock',
    messageId: `mock-${Date.now()}`,
    accepted: Array.isArray(to) ? to : [to],
  };
}

module.exports = {
  sendEmail,
  MAIL_PROVIDER,
};
