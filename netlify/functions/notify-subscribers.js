import fetch from 'node-fetch';
import { sendEmail } from '@netlify/emails';

const explicitFormId = process.env.SUBSCRIBE_FORM_ID;
const formName = process.env.SUBSCRIBE_FORM_NAME || 'subscribe-form';
const siteId = process.env.NETLIFY_SITE_ID;
const apiToken = process.env.NETLIFY_API_TOKEN;
const fromEmail = process.env.FROM_EMAIL;
const fromName = process.env.FROM_NAME || 'SashaFlores';
const fromHeader = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

const NETLIFY_API_ROOT = 'https://api.netlify.com/api/v1';
let cachedFormId;

const missing = (name) => {
  throw new Error(`Missing required environment variable: ${name}`);
};

async function resolveFormId() {
  if (cachedFormId) return cachedFormId;
  if (explicitFormId) {
    cachedFormId = explicitFormId;
    return cachedFormId;
  }

  if (!siteId) missing('NETLIFY_SITE_ID');
  if (!apiToken) missing('NETLIFY_API_TOKEN');

  const formsUrl = `${NETLIFY_API_ROOT}/sites/${siteId}/forms`;
  const formsResponse = await fetch(formsUrl, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'User-Agent': 'notify-subscribers-function'
    }
  });

  if (!formsResponse.ok) {
    throw new Error(`Failed to fetch forms: ${formsResponse.status} ${formsResponse.statusText}`);
  }

  const forms = await formsResponse.json();
  const target = forms.find((form) => form?.name === formName);

  if (!target) {
    throw new Error(`Form "${formName}" not found on site.`);
  }

  cachedFormId = target.id;
  return cachedFormId;
}

async function fetchSubscribers() {
  if (!apiToken) missing('NETLIFY_API_TOKEN');

  const id = await resolveFormId();
  const url = `${NETLIFY_API_ROOT}/forms/${id}/submissions`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'User-Agent': 'notify-subscribers-function'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subscribers: ${response.status} ${response.statusText}`);
  }

  const submissions = await response.json();
  const emails = submissions
    .map((entry) => entry?.data?.email)
    .filter(Boolean);

  // Deduplicate addresses while preserving order
  return Array.from(new Set(emails));
}

function parsePayload(body) {
  if (!body) {
    throw new Error('Request body is required.');
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch (error) {
    throw new Error('Request body must be valid JSON.');
  }

  const { title, url, excerpt, preview, publishedAt, recipients } = payload;

  if (!title || !url) {
    throw new Error('Both "title" and "url" are required in the payload.');
  }

  return {
    title,
    url,
    excerpt: excerpt || '',
    preview: preview || 'A new security insight just dropped.',
    publishedAt: publishedAt || new Date().toUTCString(),
    recipients: Array.isArray(recipients) ? recipients : undefined
  };
}

export async function handler(event) {
  try {
    if (!fromEmail) missing('FROM_EMAIL');

    const payload = parsePayload(event.body);
    let subscribers;

    if (payload.recipients && payload.recipients.length) {
      subscribers = Array.from(
        new Set(
          payload.recipients
            .map((email) => (email ? String(email).trim() : ''))
            .filter(Boolean)
        )
      );
    } else {
      subscribers = await fetchSubscribers();
    }

    if (subscribers.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No subscribers found. Email not sent.' })
      };
    }

    const sendPromises = subscribers.map((to) =>
      sendEmail({
        template: 'new-post',
        from: fromHeader,
        to,
        subject: 'SASHA FLORES PUBLISHED A NEW BLOG POST',
        parameters: {
          title: payload.title,
          url: payload.url,
          excerpt: payload.excerpt,
          preview: payload.preview,
          published_at: payload.publishedAt,
          year: new Date().getFullYear()
        }
      })
    );

    await Promise.all(sendPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Sent notification to ${subscribers.length} subscribers.` })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
