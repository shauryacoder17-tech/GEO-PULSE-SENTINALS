// @ts-nocheck
import yahooFinance from 'yahoo-finance2';

export interface MarketData {
  goldPrice: number;
  goldChange: number;
  stocks: Record<string, { price: number; change: number; history: number[] }>;
}

export async function fetchLiveMarketData(): Promise<MarketData> {
  try {
    // GC=F is Gold Futures
    // ^GSPC is S&P 500
    // ^DJI is Dow Jones
    // ^IXIC is Nasdaq
    const symbols = ['GC=F', '^GSPC', '^DJI', '^IXIC'];
    
    const quotes = await Promise.all(symbols.map(s => yahooFinance.quote(s).catch(() => null as any)));
    const historicals = await Promise.all(symbols.map(s => 
      // @ts-ignore
      yahooFinance.historical(s, { period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }) // 30 days
      .catch(() => [] as any[])
    ));

    const goldQuote = quotes[0];
    const sp500 = quotes[1];
    const dow = quotes[2];
    const nasdaq = quotes[3];

    return {
      goldPrice: goldQuote?.regularMarketPrice || 2850,
      goldChange: goldQuote?.regularMarketChangePercent || 0,
      stocks: {
        'S&P 500': {
          price: sp500?.regularMarketPrice || 0,
          change: sp500?.regularMarketChangePercent || 0,
          history: historicals[1]?.slice(-12).map(h => h.close) || []
        },
        'DOW JONES': {
          price: dow?.regularMarketPrice || 0,
          change: dow?.regularMarketChangePercent || 0,
          history: historicals[2]?.slice(-12).map(h => h.close) || []
        },
        'NASDAQ': {
           price: nasdaq?.regularMarketPrice || 0,
           change: nasdaq?.regularMarketChangePercent || 0,
           history: historicals[3]?.slice(-12).map(h => h.close) || []
        }
      }
    };
  } catch (error) {
    console.error('Error fetching market data from Yahoo Finance:', error);
    // Fallback data
    return {
      goldPrice: 2865.40,
      goldChange: 1.2,
      stocks: {
        'S&P 500': { price: 5123.45, change: 0.5, history: [5000, 5050, 5100, 5123] }
      }
    };
  }
}
