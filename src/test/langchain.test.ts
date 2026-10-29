import { afterEach, describe, expect, it, vi } from 'vitest';
import { langchain } from '@/lib/langchain';

afterEach(() => vi.unstubAllGlobals());
describe('LangChain local bridge', () => {
  it('does not report failed helper commands as installed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stdout: '', stderr: 'Command timed out', returncode: -1 }) }));
    await expect(langchain.installation()).rejects.toThrow('Command timed out');
  });
  it('installs detached with a completion log because terminal calls time out', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stdout: '', stderr: '', returncode: 0 }) });
    vi.stubGlobal('fetch', fetchMock);
    await langchain.install();
    const command = JSON.parse(fetchMock.mock.calls[0][1].body).command;
    expect(command).toContain('start "LangChain installation" /min');
    expect(command).toContain('langchain_install.ps1');
    expect(command).toContain('install.log');
  });
  it('sends agent tasks to the helper LangChain endpoint with the chosen model', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ output: 'done', steps: [], model: 'gemma3:4b' }) });
    vi.stubGlobal('fetch', fetchMock);
    const result = await langchain.runAgent('list my desktop', 'gemma3:4b');
    expect(String(fetchMock.mock.calls[0][0])).toContain('/langchain/agent');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ task: 'list my desktop', model: 'gemma3:4b' });
    expect(result.output).toBe('done');
  });
});
