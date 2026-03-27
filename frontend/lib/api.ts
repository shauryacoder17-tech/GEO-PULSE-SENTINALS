const API_BASE = 'http://localhost:5000/api';

export async function fetchLiveNews() {
  try {
    const res = await fetch(`${API_BASE}/news`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch news');
    const data = await res.json();
    return data.news;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchLiveMarket() {
  try {
    const res = await fetch(`${API_BASE}/market`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch market data');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}
