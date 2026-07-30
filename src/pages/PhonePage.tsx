import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Smartphone, RefreshCw, ChevronDown } from 'lucide-react';
import {
  getAdbStatus,
  getAdbDevices,
  adbConnect,
  adbDisconnect,
  adbCommand,
  adbScreenshot,
  adbListFiles,
  type AdbDevice,
  type AdbFileEntry,
} from '@/lib/agent';
import { useIsMobile } from '@/hooks/use-mobile';

interface TerminalEntry {
  command: string;
  output?: string;
  error?: string;
}

export default function PhonePage() {
  const isMobile = useIsMobile();

  // ADB Status
  const [adbInstalled, setAdbInstalled] = useState<boolean | null>(null);
  const [adbPath, setAdbPath] = useState('');

  // Connection
  const [tailscaleIp, setTailscaleIp] = useState('');
  const [port, setPort] = useState('5555');
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');

  // Devices
  const [devices, setDevices] = useState<AdbDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Screenshot
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);

  // File browser
  const [filePath, setFilePath] = useState('/sdcard/');
  const [files, setFiles] = useState<AdbFileEntry[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  // Terminal
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
  const [terminalRunning, setTerminalRunning] = useState(false);

  // Call
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [callActive, setCallActive] = useState(false);

  // Setup help
  const [setupOpen, setSetupOpen] = useState(false);

  // Load ADB status and devices on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await getAdbStatus();
        setAdbInstalled(status.installed);
        setAdbPath(status.path);
      } catch {
        setAdbInstalled(false);
      }
    };

    const loadDevices = async () => {
      setLoadingDevices(true);
      try {
        const result = await getAdbDevices();
        setDevices(result.devices);
      } catch {
        // Ignore error
      } finally {
        setLoadingDevices(false);
      }
    };

    loadStatus();
    loadDevices();
  }, []);

  const handleConnect = async () => {
    if (!tailscaleIp.trim()) return;
    setConnecting(true);
    setConnectionStatus('');
    try {
      const result = await adbConnect(tailscaleIp.trim(), parseInt(port) || 5555);
      setConnectionStatus(result.message);
      // Refresh devices
      const devicesResult = await getAdbDevices();
      setDevices(devicesResult.devices);
    } catch (err) {
      setConnectionStatus(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (ip: string) => {
    try {
      const result = await adbDisconnect(ip);
      setConnectionStatus(result.message);
      // Refresh devices
      const devicesResult = await getAdbDevices();
      setDevices(devicesResult.devices);
    } catch (err) {
      setConnectionStatus(err instanceof Error ? err.message : 'Disconnect failed');
    }
  };

  const handleScreenshot = async () => {
    setScreenshotLoading(true);
    try {
      const result = await adbScreenshot();
      setScreenshot(result.image);
    } catch (err) {
      console.error('Screenshot failed:', err);
    } finally {
      setScreenshotLoading(false);
    }
  };

  const handleMakeCall = async () => {
    if (!phoneNumber.trim() || callActive) return;
    try {
      setCallActive(true);
      const fullNumber = `${countryCode}${phoneNumber.trim()}`;
      await adbCommand(`am start -a android.intent.action.CALL -d tel:${fullNumber}`);
    } catch (err) {
      console.error('Call failed:', err);
      setCallActive(false);
    }
  };

  const handleEndCall = async () => {
    try {
      await adbCommand('input keyevent KEYCODE_ENDCALL');
    } catch (err) {
      console.error('End call failed:', err);
    } finally {
      setCallActive(false);
    }
  };

  const handleQuickAction = async (command: string) => {
    try {
      await adbCommand(command);
    } catch (err) {
      console.error('Quick action failed:', err);
    }
  };

  const handleFileNavigate = async (path: string) => {
    setFilesLoading(true);
    try {
      const result = await adbListFiles(path);
      setFiles(result.files);
      setFilePath(path);
    } catch (err) {
      console.error('File listing failed:', err);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFileClick = (entry: AdbFileEntry) => {
    if (entry.is_dir) {
      const newPath = filePath.endsWith('/') ? `${filePath}${entry.name}/` : `${filePath}/${entry.name}/`;
      handleFileNavigate(newPath);
    }
  };

  const handleTerminalRun = async () => {
    if (!terminalInput.trim() || terminalRunning) return;
    const cmd = terminalInput.trim();
    setTerminalInput('');
    setTerminalRunning(true);

    const entry: TerminalEntry = { command: cmd };
    setTerminalHistory((prev) => [...prev, entry]);

    try {
      const result = await adbCommand(cmd);
      setTerminalHistory((prev) =>
        prev.map((e, i) => (i === prev.length - 1 ? { ...e, output: result.stdout || result.stderr } : e))
      );
    } catch (err) {
      setTerminalHistory((prev) =>
        prev.map((e, i) => (i === prev.length - 1 ? { ...e, error: err instanceof Error ? err.message : 'Command failed' } : e))
      );
    } finally {
      setTerminalRunning(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Phone Control
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Control your Android phone via ADB over Tailscale</p>
      </div>

      {/* ADB Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ADB Status</CardTitle>
        </CardHeader>
        <CardContent>
          {adbInstalled === null ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Checking ADB installation...</span>
            </div>
          ) : adbInstalled ? (
            <div className="text-sm">
              <span className="text-green-600 font-medium">✓ ADB is installed</span>
              {adbPath && <span className="text-muted-foreground ml-2">({adbPath})</span>}
            </div>
          ) : (
            <div className="text-sm text-red-600">
              <p className="font-medium">ADB is not installed</p>
              <p className="text-muted-foreground mt-1">
                Install Android SDK Platform Tools to use phone control features.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connect Device Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connect Device</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="100.x.y.z"
              value={tailscaleIp}
              onChange={(e) => setTailscaleIp(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Port"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-20"
            />
            <Button onClick={handleConnect} disabled={connecting || !tailscaleIp.trim()}>
              {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {connecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
          {connectionStatus && (
            <p className="text-sm text-muted-foreground">{connectionStatus}</p>
          )}
        </CardContent>
      </Card>

      {/* Connected Devices Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Connected Devices</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFileNavigate('/sdcard/')}
              disabled={loadingDevices}
            >
              {loadingDevices ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingDevices ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : devices.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">
              <p>No devices connected</p>
              <p className="text-xs mt-2">
                Connect your phone's Tailscale IP above, or enable wireless debugging on your phone.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <div key={device.serial} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{device.model || device.serial}</p>
                    <p className="text-xs text-muted-foreground font-mono">{device.serial}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{device.status}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(device.serial)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screenshot Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Screenshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleScreenshot} disabled={screenshotLoading}>
            {screenshotLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {screenshotLoading ? 'Capturing...' : 'Take Screenshot'}
          </Button>
          {screenshot && (
            <div className="border rounded-md overflow-hidden">
              <img src={`data:image/png;base64,${screenshot}`} alt="Phone screenshot" className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Make a Call</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="+1"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-20"
              disabled={callActive}
            />
            <Input
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1"
              disabled={callActive}
            />
            <Button onClick={handleMakeCall} disabled={callActive || !phoneNumber.trim()}>
              {callActive ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {callActive ? 'Calling...' : 'Call'}
            </Button>
            <Button variant="destructive" onClick={handleEndCall} disabled={!callActive}>
              End Call
            </Button>
          </div>
          {callActive && (
            <p className="text-sm text-muted-foreground">Call in progress to {countryCode}{phoneNumber}...</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={isMobile ? 'grid grid-cols-2 gap-2' : 'flex gap-2 flex-wrap'}>
            <Button variant="outline" onClick={() => handleQuickAction('input keyevent KEYCODE_BACK')}>
              Back
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('input keyevent KEYCODE_HOME')}>
              Home
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('input keyevent KEYCODE_APP_SWITCH')}>
              Recents
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('input keyevent KEYCODE_POWER')}>
              Power
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Phone File Browser Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Phone Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="/sdcard/"
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={() => handleFileNavigate(filePath)} disabled={filesLoading}>
              {filesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Go
            </Button>
          </div>
          {filesLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No files found</p>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleFileClick(file)}
                >
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  {file.is_dir ? (
                    <span className="text-xs text-muted-foreground">Folder</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Terminal Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Phone Terminal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTerminalRun()}
              placeholder="Enter ADB command..."
              className="flex-1 font-mono text-sm"
              disabled={terminalRunning}
            />
            <Button onClick={handleTerminalRun} disabled={terminalRunning || !terminalInput.trim()}>
              {terminalRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Run
            </Button>
          </div>
          {terminalHistory.length > 0 && (
            <div className="bg-muted/50 rounded-md p-3 max-h-96 overflow-y-auto font-mono text-xs space-y-2">
              {terminalHistory.map((entry, i) => (
                <div key={i}>
                  <div className="text-primary">$ {entry.command}</div>
                  {entry.output && <pre className="text-foreground/80 whitespace-pre-wrap mt-1">{entry.output}</pre>}
                  {entry.error && <div className="text-red-600 mt-1">{entry.error}</div>}
                </div>
              ))}
              {terminalRunning && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Help */}
      <Collapsible open={setupOpen} onOpenChange={setSetupOpen}>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full">
                <CardTitle className="text-base">Setup Help</CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${setupOpen ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">1. Enable Developer Options</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Go to Settings &gt; About Phone &gt; Software Info &gt; tap Build Number 7 times
                  </p>
                </div>
                <div>
                  <p className="font-medium">2. Enable Wireless Debugging</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    In Developer Options, enable "Wireless debugging" or "USB debugging"
                  </p>
                </div>
                <div>
                  <p className="font-medium">3. Note IP Address and Port</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Check the Wireless Debugging screen for the IP address and port
                  </p>
                </div>
                <div>
                  <p className="font-medium">4. Use Tailscale IP</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Enter the Tailscale IP (100.x.y.z) in the Connect field above, not the local WiFi IP
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
