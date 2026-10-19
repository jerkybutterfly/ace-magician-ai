import { describe, it, expect } from 'vitest';
import { cleanPrompt, clampThreads } from '@/lib/bitnet';

describe('bitnet', () => {
  it('strips characters that break Windows commands', () => {
    expect(cleanPrompt('hi "x" & del | <a>^%!')).toBe('hi x del a');
  });
  it('keeps thread count between 1 and 16', () => {
    expect(clampThreads(0)).toBe(1);
    expect(clampThreads(64)).toBe(16);
    expect(clampThreads(NaN)).toBe(4);
  });
});
