$ErrorActionPreference = 'Continue'
$root = Join-Path $env:USERPROFILE '.aiapp\langchain'
New-Item -ItemType Directory -Force $root | Out-Null
$ok = Join-Path $root 'install.ok'
$fail = Join-Path $root 'install.failed'
Remove-Item $ok, $fail -ErrorAction SilentlyContinue

Write-Host "Installing LangChain packages (this can take a few minutes)..."
py -m pip install -U langchain langchain-core langchain-ollama langchain-community
if ($LASTEXITCODE -ne 0) {
  Write-Host "pip install failed"
  New-Item -ItemType File -Force $fail | Out-Null
  exit 1
}

Write-Host "Verifying import..."
py -c "import langchain, langchain_ollama, langchain_community; print('langchain', langchain.__version__)"
if ($LASTEXITCODE -eq 0) {
  New-Item -ItemType File -Force $ok | Out-Null
  Write-Host "LANGCHAIN INSTALL OK"
} else {
  New-Item -ItemType File -Force $fail | Out-Null
  Write-Host "LANGCHAIN VERIFY FAILED"
  exit 1
}
