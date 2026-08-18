#!/usr/bin/env bash
# Install Fooocus locally on the AM06 Pro mini PC.
# Fooocus is a Stable Diffusion XL frontend that runs offline on GPU or CPU.
# Repo: https://github.com/lllyasviel/Fooocus
set -e

INSTALL_DIR="${FOOOCUS_DIR:-$HOME/Fooocus}"
PORT="${FOOOCUS_PORT:-7865}"

echo "[fooocus] install dir: $INSTALL_DIR"
echo "[fooocus] port: $PORT"

if [ ! -d "$INSTALL_DIR" ]; then
  git clone https://github.com/lllyasviel/Fooocus.git "$INSTALL_DIR"
else
  echo "[fooocus] repo exists, pulling latest"
  (cd "$INSTALL_DIR" && git pull --ff-only || true)
fi

cd "$INSTALL_DIR"

# Fooocus prefers Python 3.10; fall back to system python if not available.
PY=$(command -v python3.10 || command -v python3)
if [ -z "$PY" ]; then
  echo "[fooocus] ERROR: python3 not found"; exit 1
fi

if [ ! -d venv ]; then
  "$PY" -m venv venv
fi
# shellcheck disable=SC1091
source venv/bin/activate

pip install --upgrade pip wheel
pip install -r requirements_versions.txt

echo "[fooocus] install complete."
echo "[fooocus] start with: bash $(dirname "$0")/fooocus_start.sh"
