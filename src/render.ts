/**
 * Generates a full-bleed SVG button image with:
 *  - coloured background (green / red / grey)
 *  - ticker symbol centred in the upper half
 *  - % change centred in the lower half
 */

type State = 'up' | 'down' | 'neutral';

const COLORS: Record<State, string> = {
  up:      '#16a34a',  // green-700
  down:    '#dc2626',  // red-600
  neutral: '#4b5563',  // grey-600 — market closed or no data
};

const COLORS_INVERTED: Record<State, string> = {
  up:      '#dc2626',  // red-600 — rising price is bad
  down:    '#16a34a',  // green-700 — falling price is good
  neutral: '#4b5563',
};

function svgToDataUri(svg: string): string {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

export function renderButton(symbol: string, changePercent: number, marketOpen: boolean, inverted = false): string {
  const state: State = !marketOpen ? 'neutral' : changePercent >= 0 ? 'up' : 'down';
  const bg = (inverted ? COLORS_INVERTED : COLORS)[state];
  const sign = changePercent >= 0 ? '+' : '';
  const pct = `${sign}${changePercent.toFixed(2)}%`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
  <rect width="72" height="72" fill="${bg}"/>
  <text x="36" y="30"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="15" font-weight="700" fill="white" text-anchor="middle"
    dominant-baseline="middle">${symbol.toUpperCase()}</text>
  <text x="36" y="50"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="14" font-weight="600" fill="white" text-anchor="middle"
    dominant-baseline="middle">${pct}</text>
</svg>`;

  return svgToDataUri(svg);
}

export function renderFxButton(symbol: string, price: number): string {
  // Strip =X suffix Yahoo Finance uses for FX pairs
  const display = symbol.replace(/=X$/i, '').toUpperCase();
  // Auto-format: 2 decimals for large rates (e.g. USDJPY ~149), 4 for smaller ones
  const formatted = price >= 100 ? price.toFixed(2) : price.toFixed(4);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
  <rect width="72" height="72" fill="#1d4ed8"/>
  <text x="36" y="30"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="15" font-weight="700" fill="white" text-anchor="middle"
    dominant-baseline="middle">${display}</text>
  <text x="36" y="50"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="13" font-weight="600" fill="white" text-anchor="middle"
    dominant-baseline="middle">${formatted}</text>
</svg>`;

  return svgToDataUri(svg);
}

export function renderLoading(symbol: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
  <rect width="72" height="72" fill="#1f2937"/>
  <text x="36" y="30"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="15" font-weight="700" fill="white" text-anchor="middle"
    dominant-baseline="middle">${symbol ? symbol.toUpperCase() : '—'}</text>
  <text x="36" y="50"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="12" fill="#9ca3af" text-anchor="middle"
    dominant-baseline="middle">···</text>
</svg>`;

  return svgToDataUri(svg);
}

export function renderError(symbol: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
  <rect width="72" height="72" fill="#7f1d1d"/>
  <text x="36" y="30"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="15" font-weight="700" fill="white" text-anchor="middle"
    dominant-baseline="middle">${symbol ? symbol.toUpperCase() : '?'}</text>
  <text x="36" y="50"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="11" fill="#fca5a5" text-anchor="middle"
    dominant-baseline="middle">error</text>
</svg>`;

  return svgToDataUri(svg);
}
