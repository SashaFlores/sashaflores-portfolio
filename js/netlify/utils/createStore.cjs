const { getStore } = require('@netlify/blobs');
const fs = require('fs/promises');
const path = require('path');

const LOCAL_ROOT = path.join(process.cwd(), '.netlify', 'local-stats');

const readLocalJSON = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`[post-stats] Failed to read local store ${filePath}:`, error.message);
    }
    return {};
  }
};

const writeLocalJSON = async (filePath, data) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const createLocalStore = (name) => {
  const filePath = path.join(LOCAL_ROOT, `${name}.json`);
  return {
    async get(key) {
      const data = await readLocalJSON(filePath);
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    async set(key, value) {
      const data = await readLocalJSON(filePath);
      data[key] = value;
      await writeLocalJSON(filePath, data);
    }
  };
};

const isLocalLike = process.env.NETLIFY_DEV === 'true' || process.env.NETLIFY_LOCAL === 'true' || !process.env.NETLIFY;

const createRemoteStore = (name) => {
  const options = { name };
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;

  // When running inside Netlify production we don't need to inject credentials manually.
  // Outside (e.g. local CLI) we can only talk to the remote store if both values are present.
  if (!process.env.NETLIFY && (!siteID || !token)) {
    return null;
  }

  try {
    if (siteID) options.siteID = siteID;
    if (token) options.token = token;
    return getStore(options);
  } catch (error) {
    console.warn(`[post-stats] Remote store unavailable: ${error.message}`);
    if (isLocalLike) {
      return null;
    }
    throw error;
  }
};

const createStore = (name) => {
  const remoteStore = createRemoteStore(name);

  if (!remoteStore && !isLocalLike) {
    throw new Error('Netlify Blobs store is not available. Ensure the site has access to the "post-stats" store.');
  }

  if (!remoteStore && isLocalLike) {
    console.warn('[post-stats] Falling back to local JSON storage for development.');
    return createLocalStore(name);
  }

  return remoteStore;
};

module.exports = createStore;
