import { describe, it, expect } from 'vitest';
import { cumulativePnl, currentWindowSlug } from '@/lib/botdash';

describe('cumulativePnl', () => {
  it('sums trade profits in order', () => {
    const pts = cumulativePnl([
      { ts: 1, pnl: 5.5 }, { ts: 2, pnl: -10 }, { ts: 3, pnl: 2.25 },
    ]);
    expect(pts).toEqual([
      { t: 1, pnl: 5.5 }, { t: 2, pnl: -4.5 }, { t: 3, pnl: -2.25 },
    ]);
  });

  it('returns empty for no trades', () => {
    expect(cumulativePnl([])).toEqual([]);
  });
});

describe('currentWindowSlug', () => {
  it('floors to the 15-minute window start', () => {
    // 1000s -> floor(1000/900)*900 = 900
    expect(currentWindowSlug(15, 1000)).toBe('btc-updown-15m-900');
  });

  it('floors to the 5-minute window start', () => {
    expect(currentWindowSlug(5, 310)).toBe('btc-updown-5m-300');
  });
});
