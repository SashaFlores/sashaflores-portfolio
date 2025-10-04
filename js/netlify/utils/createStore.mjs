import { getStore } from '@netlify/blobs';
import fs from 'fs/promises';
import path from 'path';

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

const isNetlifyDev = process.env.NETLIFY_DEV === 'true';
const isNetlifyCLI = process.env.NETLIFY_LOCAL === 'true';
const allowLocalFallback = isNetlifyDev || isNetlifyCLI;

const buildStoreOptions = (name) => {
  const options = { name };
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;

  if (siteID) options.siteID = siteID;
  if (token) options.token = token;
  return options;
};

const tryCreateRemoteStore = (name, { silentFallback } = {}) => {
  try {
    return getStore(buildStoreOptions(name));
  } catch (error) {
    if (!silentFallback) {
      console.error(`[post-stats] Failed to access blob store "${name}":`, error);
    }
    return null;
  }
};

const createStore = (name) => {
  const remoteStore = tryCreateRemoteStore(name, { silentFallback: allowLocalFallback });
  if (remoteStore) {
    return remoteStore;
  }

  if (allowLocalFallback) {
    console.warn(`[post-stats] Using on-disk fallback storage for "${name}". Counts will not persist across deploys.`);
    return createLocalStore(name);
  }

  throw new Error(`Netlify Blobs store "${name}" is unavailable in this environment.`);
};

export default createStore;
