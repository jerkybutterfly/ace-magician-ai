## Install Llama.cpp for Windows
## ---------------------------------------------------------------
## This script clones the llama.cpp repository, builds the `llama-cli.exe`
## binary, and copies it to `./llama.cpp/llama-cli.exe` (the location expected
## by src/lib/llama_cpp/run_inference.py).
##
## Prerequisites (install before running):
##   • Git
##   • CMake (>= 3.15) – add to PATH
##   • Visual Studio Build Tools (or full VS) with the C++ workload
##
## Usage:
##   1️⃣ Open PowerShell in the project root (where package.json lives)
##   2️⃣ Run: .\scripts\install_llama_cpp.ps1 [-Force]
##   3️⃣ After it finishes, launch `npm run dev` and `python agent.py` as usual.
##
## The script is idempotent – running it again will rebuild the binary unless
## you supply the `-Force` switch, which removes previous folders first.

param(
    [switch]$Force    # Re‑clone and rebuild even if folders already exist
)

# ---------------------------------------------------------------------
# Determine important paths
# ---------------------------------------------------------------------
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)   # workspace root (one level up from script)
$LlamaDir    = Join-Path $ProjectRoot "llama.cpp"
$SrcDir      = Join-Path $ProjectRoot "llama_cpp_src"
$BuildDir    = Join-Path $SrcDir "build"

# ---------------------------------------------------------------------
# Optional clean‑up when -Force is supplied
# ---------------------------------------------------------------------
if ($Force) {
    Write-Host "[install] Removing existing directories (force)…"
    Remove-Item -Recurse -Force $LlamaDir, $SrcDir -ErrorAction SilentlyContinue
}

# ---------------------------------------------------------------------
# 1️⃣ Clone the repository (if not already present)
# ---------------------------------------------------------------------
if (-not (Test-Path $SrcDir)) {
    Write-Host "[install] Cloning llama.cpp repository…"
    git clone https://github.com/ggerganov/llama.cpp $SrcDir
    if ($LASTEXITCODE -ne 0) { throw "Git clone failed." }
} else {
    Write-Host "[install] llama.cpp source already present – skipping clone."
}

# ---------------------------------------------------------------------
# 2️⃣ Configure and build with CMake
# ---------------------------------------------------------------------
if (-not (Test-Path $BuildDir)) { New-Item -ItemType Directory -Path $BuildDir | Out-Null }

Push-Location $BuildDir
Write-Host "[install] Configuring build"
cmake .. -A x64 -DCMAKE_BUILD_TYPE=Release -DGGML_NATIVE=ON -DGGML_AVX2=ON -DGGML_FMA=ON -DLLAMA_BUILD_SERVER=OFF -DLLAMA_BUILD_EXAMPLES=OFF
if ($LASTEXITCODE -ne 0) { throw "CMake configuration failed." }

Write-Host "[install] Building llama-cli.exe"
cmake --build . --config Release --target llama-cli
if ($LASTEXITCODE -ne 0) { throw "Build failed." }
Pop-Location

# ---------------------------------------------------------------------
# 3️⃣ Copy the compiled binary to the expected location
# ---------------------------------------------------------------------
$BuiltExe = Get-ChildItem -Path $BuildDir -Recurse -Filter "llama-cli.exe" | Where-Object { $_.FullName -match "Release" } | Select-Object -First 1
if (-not $BuiltExe) { throw "Could not locate built llama-cli.exe." }

if (-not (Test-Path $LlamaDir)) { New-Item -ItemType Directory -Path $LlamaDir | Out-Null }
Copy-Item -Path $BuiltExe.FullName -Destination (Join-Path $LlamaDir "llama-cli.exe") -Force
Write-Host "[install] Copied llama-cli.exe to $LlamaDir\llama-cli.exe"

# ---------------------------------------------------------------------
# 4️⃣ (Optional) download a tiny test model for quick demo
# ---------------------------------------------------------------------
$SampleModelUrl = "https://huggingface.co/ggerganov/ggml-models/resolve/main/ggml-model-q4_0.bin"
$ModelPath      = Join-Path $ProjectRoot "models\ggml-model-q4_0.bin"

if (-not (Test-Path $ModelPath)) {
    Write-Host "[install] Downloading a sample GGML model for quick testing…"
    $ModelFolder = Split-Path $ModelPath -Parent
    if (-not (Test-Path $ModelFolder)) { New-Item -ItemType Directory -Path $ModelFolder | Out-Null }
    try {
        Invoke-WebRequest -Uri $SampleModelUrl -OutFile $ModelPath -UseBasicParsing
        Write-Host "[install] Sample model saved to $ModelPath"
    } catch {
        Write-Warning "Failed to download sample model: $_"
    }
} else {
    Write-Host "[install] Sample model already present – skipping download."
}

Write-Host "\n[install] Llama.cpp installation complete. You can now use the LLama tab in the UI."
Write-Host "If you need to set the environment variable LLAMA_CPP_BINARY manually, point it to $LlamaDir\llama-cli.exe"
