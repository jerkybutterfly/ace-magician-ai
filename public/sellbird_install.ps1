$ErrorActionPreference = 'Stop'
$root = Join-Path $env:USERPROFILE '.aiapp\sellbird'
$done = Join-Path $root 'install.ok'
$failed = Join-Path $root 'install.failed'
New-Item -ItemType Directory -Force $root | Out-Null
Remove-Item $done, $failed -ErrorAction SilentlyContinue
try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is missing. Install Git for Windows, then restart the mini PC helper.' }
    $uv = Join-Path $env:USERPROFILE '.local\bin\uv.exe'
    if (-not (Test-Path $uv)) {
        Write-Output 'Installing uv from astral.sh...'
        Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
    }
    if (-not (Test-Path $uv)) { throw 'uv installation failed.' }
    $repo = Join-Path $root 'repo'
    if (-not (Test-Path $repo)) {
        & git clone https://github.com/ethanplusai/sellbird.git $repo
        if ($LASTEXITCODE -ne 0) { throw 'Could not clone Sellbird. Check the install log.' }
    }
    Set-Location $repo
    if (-not (Test-Path 'pyproject.toml')) { throw 'Incomplete repository. Remove the .aiapp\sellbird\repo folder and retry.' }
    & $uv python install 3.12
    if ($LASTEXITCODE -ne 0) { throw 'Python 3.12 installation failed.' }
    & $uv venv --python 3.12 .venv
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the Python environment.' }
    & $uv pip install --python (Join-Path $repo '.venv\Scripts\python.exe') -e .
    if ($LASTEXITCODE -ne 0) { throw 'Sellbird dependency installation failed.' }
    if (-not (Test-Path '.env') -and (Test-Path '.env.example')) { Copy-Item '.env.example' '.env' }
    & (Join-Path $repo '.venv\Scripts\sellbird.exe') --help
    if ($LASTEXITCODE -ne 0) { throw 'Sellbird verification failed.' }
    Set-Content $done 'Sellbird installed successfully'
    Write-Output 'Sellbird installed. Sign in to Claude Code on the mini PC (claude login), then start the dashboard.'
} catch {
    Set-Content $failed $_.Exception.Message
    Write-Error $_
    exit 1
}
