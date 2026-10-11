import { describe, it, expect } from 'vitest';
import { signal, stakeSize, payoutFor, calibrate } from '@/lib/polymarket';

describe('polymarket paper rules', () => {
  it('only trades when edge is at least 15%', () => {
    expect(signal(0.68, 0.42)?.side).toBe('YES');
    expect(signal(0.5, 0.42)).toBeNull();
    expect(signal(0.2, 0.42)?.side).toBe('NO');
  });
  it('caps stake at 5% of bankroll', () => {
    expect(stakeSize(1000, 0.99, 0.1)).toBe(50);
    expect(stakeSize(1000, 0.3, 0.5)).toBe(0);
  });
  it('pays $1 per share on a win', () => {
    expect(payoutFor({ stake: 42, entry: 0.42 }, true)).toBe(100);
    expect(payoutFor({ stake: 42, entry: 0.42 }, false)).toBe(0);
  });
  it('shrinks over-confident estimates', () => {
    expect(calibrate(0.9)).toBeCloseTo(0.78);
  });
});
