import { Router } from 'express';
import { fetchLiveNews } from '../services/news';
import { fetchLiveMarketData } from '../services/market';

const router = Router();

// In a real app we'd cache these, but for hackathon demo we'll fetch on demand or use a simple in-memory cache
let newsCache = { data: null as any, lastFetch: 0 };
let marketCache = { data: null as any, lastFetch: 0 };

router.get('/news', async (req, res) => {
  const now = Date.now();
  if (!newsCache.data || now - newsCache.lastFetch > 60000) { // 1 min cache
    newsCache.data = await fetchLiveNews();
    newsCache.lastFetch = now;
  }
  res.json({ news: newsCache.data });
});

router.get('/market', async (req, res) => {
  const now = Date.now();
  if (!marketCache.data || now - marketCache.lastFetch > 60000) { // 1 min cache
    marketCache.data = await fetchLiveMarketData();
    marketCache.lastFetch = now;
  }
  res.json(marketCache.data);
});

export default router;
