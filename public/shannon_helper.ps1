param([Parameter(Mandatory=$true)][string]$Payload, [switch]$Worker)
$ErrorActionPreference = 'Stop'
$root = Join-Path $env:USERPROFILE '.aiapp\shannon'
New-Item -ItemType Directory -Force -Path $root | Out-Null
$request = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($Payload)) | ConvertFrom-Json
$action = [string]$request.action
if ($action -notin @('install','scan','stop','status','logs')) { throw 'Unknown action' }
function BashQuote([string]$value) { return "'" + $value.Replace("'", "'\''") + "'" }
if ($action -eq 'logs') {
  foreach ($name in @('install','scan','stop')) {
    $log = Join-Path $root "$name.log"
    if (Test-Path $log) { Write-Output "--- $name ---"; Get-Content -LiteralPath $log -Tail 100 }
  }
  exit 0
}
if ($action -eq 'status') {
  foreach ($name in @('install','scan','stop')) {
    $state = 'NOT STARTED'
    foreach ($suffix in @('running','ok','failed')) {
      if (Test-Path (Join-Path $root "$name.$suffix")) { $state = $suffix.ToUpper() }
    }
    Write-Output "$name : $state"
  }
  $probe = 'test -x "$HOME/.aiapp/shannon/npm/bin/shannon" && "$HOME/.aiapp/shannon/npm/bin/shannon" version'
  $probe | & wsl.exe --exec bash -s
  if ($LASTEXITCODE -ne 0) { Write-Output 'Shannon installation not verified in the default WSL distribution.' }
  exit 0
}
if (-not $Worker) {
  $marker = Join-Path $root "$action.running"
  if (Test-Path $marker) { throw "$action is already in progress. Check status and logs." }
  foreach ($suffix in @('ok','failed')) { Remove-Item (Join-Path $root "$action.$suffix") -ErrorAction SilentlyContinue }
  Set-Content $marker 'Starting'
  try {
    Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"' + $PSCommandPath + '"'),'-Payload',$Payload,'-Worker') | Out-Null
  } catch { Remove-Item $marker -ErrorAction SilentlyContinue; throw }
  Write-Output "$action started in the background. Check status and logs for completion."
  exit 0
}
try {
  $prefix = @'
set -euo pipefail
export PATH="$HOME/.aiapp/shannon/npm/bin:$PATH"
mkdir -p "$HOME/.aiapp/shannon"
cd "$HOME/.aiapp/shannon"
'@
  if ($action -eq 'install') {
    if ([string]$request.version -ne '3.5.0') { throw 'Unsupported Shannon release' }
    $bash = $prefix + "`n" + @'
node -e 'if(Number(process.versions.node.split(".")[0])<22) { console.error("Node.js 22+ is required inside WSL"); process.exit(1) }'
docker info > /dev/null
npm install --prefix "$HOME/.aiapp/shannon/npm" --global @keygraph/shannon@3.5.0
shannon version
'@
  } elseif ($action -eq 'scan') {
    $s = $request.scan
    if ($s.authorised -ne $true -or $s.nonProduction -ne $true) { throw 'Written permission and a non-production target are required' }
    $uri = [Uri]$s.url
    if ($uri.Scheme -notin @('http','https') -or $uri.UserInfo) { throw 'Invalid target URL' }
    if ($s.workspace -notmatch '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$' -or $s.model -notmatch '^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$' -or -not $s.repository.StartsWith('/') -or $s.repository -match '[\r\n\x00]') { throw 'Invalid scan settings' }
    $models = @{ providers = @{ ollama = @{ baseUrl = 'http://host.docker.internal:11434/v1'; api = 'openai-completions'; apiKey = 'ollama'; models = @(@{id=$s.model}) } } } | ConvertTo-Json -Depth 8 -Compress
    $model64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($models))
    $bash = $prefix + "`n" + 'printf %s ' + (BashQuote $model64) + ' | base64 --decode > models.json' + "`n"
    $bash += 'test -d ' + (BashQuote $s.repository) + "`n"
    $bash += 'export SHANNON_AI_API_KEY=ollama' + "`n" + 'export SHANNON_AI_MODEL=' + (BashQuote ('ollama:' + $s.model)) + "`n"
    $bash += 'shannon start -u ' + (BashQuote $s.url) + ' -r ' + (BashQuote $s.repository) + ' -w ' + (BashQuote $s.workspace) + ' --models-config "$HOME/.aiapp/shannon/models.json" --follow'
  } else {
    if ($request.scan.workspace -notmatch '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$') { throw 'Invalid workspace' }
    $bash = $prefix + "`n" + 'shannon stop ' + (BashQuote $request.scan.workspace) + ' --yes'
  }
  $bash | & wsl.exe --exec bash -s *> (Join-Path $root "$action.log")
  if ($LASTEXITCODE -ne 0) { throw "Shannon $action failed; see $action.log" }
  Set-Content (Join-Path $root "$action.ok") 'Completed'
} catch {
  $_ | Out-String | Add-Content (Join-Path $root "$action.log")
  Set-Content (Join-Path $root "$action.failed") 'Failed'
} finally {
  Remove-Item (Join-Path $root "$action.running") -ErrorAction SilentlyContinue
}