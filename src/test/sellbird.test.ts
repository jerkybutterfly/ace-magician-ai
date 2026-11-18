import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanWebsiteUrl, sellbird } from '@/lib/sellbird';

afterEach(() => vi.unstubAllGlobals());
describe('Sellbird local bridge', () => {
  it('accepts a plain website address', () => {
    expect(cleanWebsiteUrl('https://your-company.com')).toBe('https://your-company.com/');
  });
  it('rejects addresses that could break out of the command line', () => {
    expect(() => cleanWebsiteUrl('https://a.com/?x="&calc')).toThrow();
    expect(() => cleanWebsiteUrl('javascript:alert(1)')).toThrow();
    expect(() => cleanWebsiteUrl('not a url')).toThrow();
  });
  it('does not report failed helper commands as installed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stdout: '', stderr: 'Command timed out', returncode: -1 }) }));
    await expect(sellbird.installation()).rejects.toThrow('Command timed out');
  });
  it('starts the dashboard detached on its own window', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stdout: '', stderr: '', returncode: 0 }) });
    vi.stubGlobal('fetch', fetchMock);
    await sellbird.start();
    const command = JSON.parse(fetchMock.mock.calls[0][1].body).command;
    expect(command).toContain('start "Sellbird dashboard" /min');
    expect(command).toContain('sellbird.exe" dashboard');
  });
  it('pause sending runs the pause command', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stdout: '', stderr: '', returncode: 0 }) });
    vi.stubGlobal('fetch', fetchMock);
    await sellbird.pauseSending();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).command).toContain('sending pause');
  });
});
