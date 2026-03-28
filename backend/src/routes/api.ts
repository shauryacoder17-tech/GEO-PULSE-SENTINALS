import { Router } from 'express';
import { fetchLiveNews } from '../services/news';
import { fetchLiveMarketData } from '../services/market';
import { generateCountryPrediction } from '../services/ai';
import { fetchLiveFlights } from '../services/flightService';
import { fetchLiveConflicts } from '../services/conflictService';

const router = Router();

// In a real app we'd cache these, but for hackathon demo we'll fetch on demand or use a simple in-memory cache
let newsCache = { data: null as any, lastFetch: 0 };
let marketCache = { data: null as any, lastFetch: 0 };

router.get('/news', async (req, res) => {
  try {
    const now = Date.now();
    if (!newsCache.data || newsCache.data.length === 0 || now - newsCache.lastFetch > 60000) { // 1 min cache
      // Race the fetch against a 15-second timeout
      const fetchPromise = fetchLiveNews();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('News fetch timeout')), 15000)
      );
      try {
        newsCache.data = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (timeoutErr) {
        console.warn('News fetch timed out, using cached data or empty');
        if (!newsCache.data) newsCache.data = [];
      }
      newsCache.lastFetch = now;
    }
    res.json({ news: newsCache.data });
  } catch (err) {
    console.error('News route error:', err);
    res.json({ news: [] });
  }
});

router.get('/market', async (req, res) => {
  const now = Date.now();
  if (!marketCache.data || now - marketCache.lastFetch > 60000) { // 1 min cache
    marketCache.data = await fetchLiveMarketData();
    marketCache.lastFetch = now;
  }
  res.json(marketCache.data);
});

router.get('/flights', async (req, res) => {
  try {
    const flights = await fetchLiveFlights();
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flight data' });
  }
});

router.get('/conflicts', async (req, res) => {
  try {
    const conflicts = await fetchLiveConflicts();
    res.json(conflicts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conflict data' });
  }
});

router.post('/custom-ai', async (req, res) => {
  const { processCustomModelInference } = await import('../services/customMarketAI');
  const result = await processCustomModelInference(req.body);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

router.get('/ai/:countryCode', async (req, res) => {
  const { countryCode } = req.params;
  try {
    const prediction = await generateCountryPrediction(countryCode.toUpperCase());
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
});

export default router;
