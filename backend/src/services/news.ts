import Parser from 'rss-parser';

const parser = new Parser();

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export async function fetchLiveNews(): Promise<NewsItem[]> {
  try {
    // Google News RSS globally
    const feed = await parser.parseURL('https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en');
    
    return feed.items.slice(0, 15).map((item, index) => ({
      id: `news-${index}-${Date.now()}`,
      title: item.title || 'Untitled',
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      source: item.source || 'Google News',
    }));
  } catch (error) {
    console.error('Error fetching live news via RSS:', error);
    return [];
  }
}
