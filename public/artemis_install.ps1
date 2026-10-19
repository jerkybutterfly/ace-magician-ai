$ErrorActionPreference = 'Stop'
$root = Join-Path $env:USERPROFILE '.aiapp\artemis'
$done = Join-Path $root 'install.ok'
$failed = Join-Path $root 'install.failed'
New-Item -ItemType Directory -Force $root | Out-Null
Remove-Item $done, $failed -ErrorAction SilentlyContinue
try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is missing. Install Git for Windows, then restart the mini PC helper.' }
    $uv = Join-Path $env:USERPROFILE '.local\bin\uv.exe'
    if (Get-Command uv -ErrorAction SilentlyContinue) { $uv = (Get-Command uv).Source }
    if (-not (Test-Path $uv)) {
        Write-Output 'Installing uv from astral.sh...'
        Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
    }
    if (-not (Test-Path $uv)) { throw 'uv installation failed.' }
    if (-not (Test-Path (Join-Path $root 'pyproject.toml'))) {
        & git clone https://github.com/google/artemis.git (Join-Path $root 'repo')
        if ($LASTEXITCODE -ne 0) { throw 'Could not clone Artemis. Check the install log.' }
    }
    Set-Location (Join-Path $root 'repo')
    & $uv python install 3.12
    if ($LASTEXITCODE -ne 0) { throw 'Python 3.12 installation failed.' }
    & $uv sync --python 3.12
    if ($LASTEXITCODE -ne 0) { throw 'Artemis dependency installation failed.' }
    & $uv run artemis --help
    if ($LASTEXITCODE -ne 0) { throw 'Artemis verification failed.' }
    Set-Content $done 'Artemis installed successfully'
    Write-Output 'Artemis installed. Connect your Android device and configure a vision model in the console.'
} catch {
    Set-Content $failed $_.Exception.Message
    Write-Error $_
    exit 1
}