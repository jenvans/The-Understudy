import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import type { CacheEntry } from '../gemini';

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for the admin page
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const redis = getRedis();
  if (!redis) {
    return res.status(500).json({ error: 'Redis not configured' });
  }

  // ── GET: List all cache entries ──────────────────────────────────
  if (req.method === 'GET') {
    try {
      const entries: (CacheEntry & { key: string })[] = [];
      let cursor = '0';

      // Scan all ai:* keys
      do {
        const result = await redis.scan(cursor, {
          match: 'ai:*',
          count: 100,
        });
        cursor = String(result[0]);

        const keys = result[1] as string[];

        // Fetch each entry
        for (const k of keys) {
          const val = await redis.get<CacheEntry>(k);
          if (val) {
            entries.push({ ...val, key: k });
          }
        }
      } while (cursor !== '0');

      // Sort by most-searched first
      entries.sort((a, b) => (b.searchCount ?? 0) - (a.searchCount ?? 0));

      return res.status(200).json({
        total: entries.length,
        entries,
      });
    } catch (e) {
      console.error('Cache list error:', e);
      return res.status(500).json({ error: 'Failed to list cache entries' });
    }
  }

  // ── PATCH: Update entry status (approve / reject) ────────────────
  if (req.method === 'PATCH') {
    const { key, status } = req.body as { key?: string; status?: string };

    if (!key || typeof key !== 'string' || !key.startsWith('ai:')) {
      return res.status(400).json({ error: 'Missing or invalid key' });
    }
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved, rejected, or pending' });
    }

    try {
      const entry = await redis.get<CacheEntry>(key);
      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      await redis.set(key, { ...entry, status } as CacheEntry);
      return res.status(200).json({ success: true, key, status });
    } catch (e) {
      console.error('Cache update error:', e);
      return res.status(500).json({ error: 'Failed to update entry' });
    }
  }

  // ── DELETE: Remove a cache entry ─────────────────────────────────
  if (req.method === 'DELETE') {
    const { key } = req.body as { key?: string };

    if (!key || typeof key !== 'string' || !key.startsWith('ai:')) {
      return res.status(400).json({ error: 'Missing or invalid key' });
    }

    try {
      await redis.del(key);
      return res.status(200).json({ success: true, key });
    } catch (e) {
      console.error('Cache delete error:', e);
      return res.status(500).json({ error: 'Failed to delete entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
