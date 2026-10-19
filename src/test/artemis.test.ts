import { afterEach, describe, expect, it, vi } from 'vitest';
import { artemis, artemisConsoleUrl } from '@/lib/artemis';

afterEach(() => vi.unstubAllGlobals());
describe('Artemis local bridge', () => {
  it('opens the console on the configured mini PC, not the phone', () => {
    expect(artemisConsoleUrl('http://192.168.1.50:8484')).toBe('http://192.168.1.50:8766/');
  });
  it('does not report failed helper commands as installed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stdout: '', stderr: 'Command timed out', returncode: -1 }) }));
    await expect(artemis.installation()).rejects.toThrow('Command timed out');
  });
  it('starts the Windows console detached on the separate Artemis port', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stdout: '', stderr: '', returncode: 0 }) });
    vi.stubGlobal('fetch', fetchMock);
    await artemis.start();
    const command = JSON.parse(fetchMock.mock.calls[0][1].body).command;
    expect(command).toContain('start "Artemis console" /min');
    expect(command).toContain('--port 8766 --no-open');
  });
});