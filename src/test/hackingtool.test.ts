import { afterEach, describe, expect, it, vi } from 'vitest';
import { hackingtool } from '@/lib/hackingtool';

afterEach(() => vi.unstubAllGlobals());
describe('HackingTool local catalogue', () => {
  it('loads metadata through the configured helper, not a cloud runner', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ loaded: true, tools: [], mode: 'read-only' }) });
    vi.stubGlobal('fetch', fetchMock);
    const result = await hackingtool.catalog();
    expect(String(fetchMock.mock.calls[0][0])).toContain('/hackingtool/catalog');
    expect(fetchMock.mock.calls[0][1].method).toBe('GET');
    expect(result.mode).toBe('read-only');
  });
  it('reports old helpers instead of claiming the catalogue is installed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(hackingtool.catalog()).rejects.toThrow('Update the mini PC helper');
  });
  it('requests only catalogue download, with no executable commands', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ loaded: true }) });
    vi.stubGlobal('fetch', fetchMock);
    await hackingtool.download();
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  });
});