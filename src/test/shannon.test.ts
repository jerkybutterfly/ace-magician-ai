import { afterEach, describe, expect, it, vi } from 'vitest';
import { shannon, validateShannonScan, type ShannonScan } from '@/lib/shannon';

const scan: ShannonScan = { url: 'http://host.docker.internal:3000', repository: '/mnt/c/Projects/my-app', model: 'qwen3:8b', workspace: 'staging-test', authorised: true, nonProduction: true };
afterEach(() => vi.unstubAllGlobals());
describe('Shannon local integration', () => {
  it('requires explicit written permission', () => {
    expect(() => validateShannonScan({ ...scan, authorised: false })).toThrow('authorisation');
  });
  it('requires a non-production environment', () => {
    expect(() => validateShannonScan({ ...scan, nonProduction: false })).toThrow('non-production');
  });
  it('accepts the Docker host target and WSL repository path', () => {
    expect(() => validateShannonScan(scan)).not.toThrow();
    expect(() => validateShannonScan({ ...scan, repository: 'C:\\Projects' })).toThrow('WSL');
  });
  it('rejects credentials and non-web protocols', () => {
    for (const url of ['file:///etc/passwd', 'https://user:secret@example.com']) expect(() => validateShannonScan({ ...scan, url })).toThrow('HTTP');
  });
  it('rejects shell injection in model and workspace values', () => {
    expect(() => validateShannonScan({ ...scan, model: 'qwen; whoami' })).toThrow('model');
    expect(() => validateShannonScan({ ...scan, workspace: 'test & whoami' })).toThrow('workspace');
  });
  it('does not treat helper failures as successful commands', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ returncode: -1, stderr: 'Command timed out' }) }));
    await expect(shannon.install()).rejects.toThrow('timed out');
  });
  it('sends a pinned release and scan settings as encoded data through the local helper', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ returncode: 0, stdout: 'started' }) });
    vi.stubGlobal('fetch', fetchMock);
    await shannon.start(scan);
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/terminal$/);
    const command = JSON.parse(fetchMock.mock.calls[0][1].body).command;
    const encoded = command.match(/-Payload "([^"]+)"/)[1];
    expect(JSON.parse(atob(encoded))).toEqual({ action: 'scan', version: '3.5.0', scan });
    expect(command).toContain('shannon_helper.ps1');
    expect(command).not.toContain(scan.url);
  });
});