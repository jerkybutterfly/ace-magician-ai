#!/usr/bin/env bash
# Start Fooocus in the background and expose its API on the LAN.
set -e
INSTALL_DIR="${FOOOCUS_DIR:-$HOME/Fooocus}"
PORT="${FOOOCUS_PORT:-7865}"
EXTRA_ARGS="${FOOOCUS_ARGS:-}"

# AM06 Pro has no discrete GPU by default → --always-cpu keeps it stable.
# If a CUDA/ROCm GPU is present, drop the flag by exporting FOOOCUS_ARGS="".
if [ -z "${FOOOCUS_ARGS+x}" ]; then
  EXTRA_ARGS="--always-cpu --always-high-vram"
fi

cd "$INSTALL_DIR"
# shellcheck disable=SC1091
source venv/bin/activate

nohup python entry_with_update.py \
  --listen 0.0.0.0 \
  --port "$PORT" \
  $EXTRA_ARGS \
  > "$INSTALL_DIR/fooocus.log" 2>&1 &

echo $! > "$INSTALL_DIR/fooocus.pid"
echo "[fooocus] started on http://0.0.0.0:$PORT (pid $(cat "$INSTALL_DIR/fooocus.pid"))"
