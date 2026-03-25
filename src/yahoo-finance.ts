export interface QuoteResult {
  symbol: string;
  price: number;
  changePercent: number;
  marketOpen: boolean;
}

/**
 * Fetch intra-day quote data using the v8 chart endpoint (1m interval, 1d range).
 * chartPreviousClose is reliable on this endpoint and gives the correct base.
 */
export async function fetchQuote(symbol: string): Promise<QuoteResult> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1m&range=1d`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance returned ${res.status} for ${symbol}`);
  }

  const json = (await res.json()) as YahooChartResponse;
  const meta = json?.chart?.result?.[0]?.meta;

  if (!meta) {
    throw new Error(`No data returned for symbol "${symbol}"`);
  }

  const price = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose;
  const changePercent = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;

  const now = Math.floor(Date.now() / 1000);
  const regular = meta.currentTradingPeriod?.regular;
  const marketOpen = regular ? now >= regular.start && now < regular.end : false;

  return { symbol: meta.symbol, price, changePercent, marketOpen };
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta: {
        symbol: string;
        regularMarketPrice: number;
        chartPreviousClose: number;
        currentTradingPeriod?: {
          regular?: { start: number; end: number };
        };
      };
    }>;
  };
}
