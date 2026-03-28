import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 5000, // 5 second timeout per feed
  headers: {
    'User-Agent': 'Mozilla/5.0 (GeoPulse Sentinel News Aggregator)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
});

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

const FALLBACK_NEWS: NewsItem[] = [
  { id: 'fallback-1', title: 'Global tensions rise as diplomatic talks stall in multiple regions', link: '', pubDate: new Date().toISOString(), source: 'GeoPulse Intel' },
  { id: 'fallback-2', title: 'Earthquake monitoring systems report increased seismic activity in Pacific Ring', link: '', pubDate: new Date().toISOString(), source: 'GeoPulse Intel' },
  { id: 'fallback-3', title: 'International sanctions reshape global commodity markets', link: '', pubDate: new Date().toISOString(), source: 'GeoPulse Intel' },
  { id: 'fallback-4', title: 'Climate change accelerates extreme weather patterns worldwide', link: '', pubDate: new Date().toISOString(), source: 'GeoPulse Intel' },
  { id: 'fallback-5', title: 'Cybersecurity threats surge across critical infrastructure sectors', link: '', pubDate: new Date().toISOString(), source: 'GeoPulse Intel' },
  { id: 'fallback-6', title: 'Energy markets volatile amid geopolitical uncertainty', link: '', pubDate: new Date().toISOString(), source: 'GeoPulse Intel' },
  { id: 'fallback-7', title: 'UN Security Council convenes emergency session on regional conflicts', link: '', pubDate: new Date().toISOString(), source: 'GeoPulse Intel' },
  { id: 'fallback-8', title: 'Supply chain disruptions impact global trade flows', link: '', pubDate: new Date().toISOString(), source: 'GeoPulse Intel' },
];

export async function fetchLiveNews(): Promise<NewsItem[]> {
  const feedsToTry = [
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', name: 'NY Times World' },
    { url: 'https://feeds.reuters.com/reuters/worldNews', name: 'Reuters' },
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', name: 'Google News' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' },
  ];

  // Try all feeds concurrently with individual timeouts
  const results = await Promise.allSettled(
    feedsToTry.map(async (feedConfig) => {
      try {
        const feed = await parser.parseURL(feedConfig.url);
        if (feed && feed.items && feed.items.length > 0) {
          return feed.items.slice(0, 10).map((item, index) => ({
            id: `news-${feedConfig.name}-${index}-${Date.now()}`,
            title: item.title || 'Untitled',
            link: item.link || '',
            pubDate: item.pubDate || new Date().toISOString(),
            source: feedConfig.name,
          }));
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${feedConfig.name}: ${(error as Error).message}`);
      }
      return null;
    })
  );

  // Collect all successful results
  const allNews: NewsItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      allNews.push(...result.value);
    }
  }

  if (allNews.length > 0) {
    // Sort by date, newest first, and return top 15
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    return allNews.slice(0, 15);
  }

  console.warn('All live news RSS feeds failed. Using fallback news.');
  return FALLBACK_NEWS;
}
