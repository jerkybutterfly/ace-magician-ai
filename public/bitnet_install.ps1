$ErrorActionPreference = 'Stop'
$root = Join-Path $env:USERPROFILE '.aiapp\bitnet'
$repo = Join-Path $root 'repo'
$done = Join-Path $root 'install.ok'
$failed = Join-Path $root 'install.failed'
New-Item -ItemType Directory -Force $root | Out-Null
Remove-Item $done, $failed -ErrorAction SilentlyContinue
try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is missing. Install Git for Windows, then restart the mini PC helper.' }
    $uv = Join-Path $env:USERPROFILE '.local\bin\uv.exe'
    if (-not (Test-Path $uv)) {
        Write-Output 'Installing uv...'
        Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
    }
    if (-not (Test-Path $uv)) { throw 'uv installation failed.' }

    $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
    $vs = if (Test-Path $vswhere) { & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Llvm.Clang -property installationPath } else { $null }
    if (-not $vs) {
        Write-Output 'Installing Visual Studio Build Tools with Clang + CMake (large download, can take 20+ minutes)...'
        & winget install --id Microsoft.VisualStudio.2022.BuildTools -e --accept-package-agreements --accept-source-agreements --override "--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --add Microsoft.VisualStudio.Component.VC.Llvm.Clang --add Microsoft.VisualStudio.Component.VC.CMake.Project --add Microsoft.VisualStudio.Component.VC.Llvm.ClangToolset --includeRecommended"
        $vs = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Llvm.Clang -property installationPath
    }
    if (-not $vs) { throw 'Visual Studio Build Tools with Clang not found. Install them, then retry.' }
    $devcmd = Join-Path $vs 'Common7\Tools\VsDevCmd.bat'

    if (-not (Test-Path $repo)) {
        & git clone --recursive https://github.com/microsoft/BitNet.git $repo
        if ($LASTEXITCODE -ne 0) { throw 'Could not download BitNet.' }
    }
    Set-Location $repo
    & $uv venv --python 3.11 .venv
    if ($LASTEXITCODE -ne 0) { throw 'Could not create Python environment.' }
    $py = Join-Path $repo '.venv\Scripts\python.exe'
    & $uv pip install --python $py -r requirements.txt "huggingface_hub[cli]"
    if ($LASTEXITCODE -ne 0) { throw 'Python package installation failed.' }

    $model = Join-Path $repo 'models\BitNet-b1.58-2B-4T'
    & $py -c "from huggingface_hub import snapshot_download; snapshot_download('microsoft/BitNet-b1.58-2B-4T-gguf', local_dir=r'$model')"
    if ($LASTEXITCODE -ne 0) { throw 'Model download failed.' }

    & cmd /c "call `"$devcmd`" -arch=x64 && `"$py`" setup_env.py -md `"$model`" -q i2_s"
    if ($LASTEXITCODE -ne 0) { throw 'Building bitnet.cpp failed. See logs\compile.log in the BitNet folder.' }
    if (-not (Test-Path (Join-Path $model 'ggml-model-i2_s.gguf'))) { throw 'Model file missing after build.' }
    Set-Content $done 'BitNet installed'
    Write-Output 'BitNet installed. Try Run prompt or Benchmark.'
} catch {
    Set-Content $failed $_.Exception.Message
    Write-Error $_
    exit 1
}
