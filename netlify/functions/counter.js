const { neon } = require('@neondatabase/serverless');

let sqlClient;
let tableReadyPromise;

const getSqlClient = () => {
  if (sqlClient) return sqlClient;

  const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Database connection string is not configured.');
  }
  sqlClient = neon(connectionString);
  return sqlClient;
};

const ensureTable = async () => {
  if (tableReadyPromise) return tableReadyPromise;

  const sql = getSqlClient();
  tableReadyPromise = sql`
    CREATE TABLE IF NOT EXISTS post_stats (
      slug TEXT PRIMARY KEY,
      views BIGINT NOT NULL DEFAULT 0,
      likes BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `.catch((error) => {
    tableReadyPromise = null;
    throw error;
  });

  return tableReadyPromise;
};

const normalizeCounts = (row = {}) => ({
  views: Number(row.views ?? 0) || 0,
  likes: Number(row.likes ?? 0) || 0,
});

const fetchCounts = async (slug) => {
  const sql = getSqlClient();
  await ensureTable();
  const rows = await sql`
    SELECT views, likes
    FROM post_stats
    WHERE slug = ${slug}
    LIMIT 1;
  `;
  return normalizeCounts(rows[0]);
};

const incrementMetric = async (slug, metric) => {
  const sql = getSqlClient();
  await ensureTable();

  const viewsIncrement = metric === 'views' ? 1 : 0;
  const likesIncrement = metric === 'likes' ? 1 : 0;

  const rows = await sql`
    INSERT INTO post_stats (slug, views, likes)
    VALUES (${slug}, ${viewsIncrement}, ${likesIncrement})
    ON CONFLICT (slug) DO UPDATE
      SET views = post_stats.views + EXCLUDED.views,
          likes = post_stats.likes + EXCLUDED.likes,
          updated_at = NOW()
    RETURNING views, likes;
  `;

  return normalizeCounts(rows[0]);
};

const sendJSON = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return sendJSON(200, { ok: true });
  }

  let slug = (event.queryStringParameters?.slug || '').trim();
  if (!slug && event.body) {
    try {
      const parsed = JSON.parse(event.body);
      if (parsed?.slug) slug = String(parsed.slug).trim();
    } catch (error) {
      return sendJSON(400, { error: 'Invalid JSON body' });
    }
  }

  if (!slug) {
    return sendJSON(400, { error: 'Missing slug' });
  }

  if (event.httpMethod === 'GET') {
    try {
      const counts = await fetchCounts(slug);
      return sendJSON(200, counts);
    } catch (error) {
      console.error('Failed to fetch counts', error);
      return sendJSON(502, { error: 'Failed to fetch counts' });
    }
  }

  if (event.httpMethod === 'POST') {
    let payload = {};
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (error) {
      return sendJSON(400, { error: 'Invalid JSON body' });
    }

    const metric = String(payload.metric || '').toLowerCase();
    if (!['views', 'likes'].includes(metric)) {
      return sendJSON(400, { error: 'Invalid metric' });
    }

    try {
      const counts = await incrementMetric(slug, metric);
      return sendJSON(200, counts);
    } catch (error) {
      console.error('Failed to update counts', error);
      return sendJSON(502, { error: 'Failed to update counts' });
    }
  }

  return sendJSON(405, { error: 'Method not allowed' });
};
