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

const createRemoteStore = (name) => {
  try {
    const options = { name };
    const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
    if (siteID && token) {
      options.siteID = siteID;
      options.token = token;
    }
    return getStore(options);
  } catch (error) {
    console.warn(`[post-stats] Remote store unavailable: ${error.message}`);
    return null;
  }
};

const createStore = (name) => {
  const remoteStore = createRemoteStore(name);
  const localStore = createLocalStore(name);

  const getValue = async (key) => {
    if (remoteStore) {
      try {
        const value = await remoteStore.get(key);
        if (value !== undefined && value !== null) {
          return value;
        }
      } catch (error) {
        console.warn(`[post-stats] Remote get failed for ${key}: ${error.message}`);
      }
    }
    return localStore.get(key);
  };

  const setValue = async (key, value) => {
    if (remoteStore) {
      try {
        await remoteStore.set(key, value);
      } catch (error) {
        console.warn(`[post-stats] Remote set failed for ${key}: ${error.message}`);
        await localStore.set(key, value);
        return;
      }
    }
    await localStore.set(key, value);
  };

  return {
    get: getValue,
    set: setValue
  };
};

module.exports = createStore;
