const { getStore } = require("@netlify/blobs");

const STORE_NAME = "post-stats";
const KEY_PREFIX = "views:";

const jsonHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};

const getSlugFromEvent = (event) => {
  const querySlug = event.queryStringParameters?.post;
  if (querySlug) return querySlug.trim();

  if (event.body) {
    try {
      const parsed = JSON.parse(event.body);
      if (parsed?.post) {
        return String(parsed.post).trim();
      }
    } catch (error) {
      console.error("views function: failed to parse body", error);
    }
  }
  return "";
};

exports.handler = async (event) => {
  if (!["GET", "POST"].includes(event.httpMethod)) {
    return { statusCode: 405, headers: jsonHeaders, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const slug = getSlugFromEvent(event);
  if (!slug) {
    return { statusCode: 400, headers: jsonHeaders, body: JSON.stringify({ error: "Missing post identifier" }) };
  }

  const store = getStore({ name: STORE_NAME });
  const key = `${KEY_PREFIX}${slug}`;

  try {
    const currentRaw = await store.get(key);
    let current = Number(currentRaw) || 0;

    if (event.httpMethod === "POST") {
      current += 1;
      await store.set(key, String(current));
    }

    return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ total: current }) };
  } catch (error) {
    console.error("views function error", error);
    return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ error: "Server Error" }) };
  }
};
