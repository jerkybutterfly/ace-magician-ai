import subprocess
import os
from typing import Iterator

# Path to the compiled llama.cpp binary (adjust if placed elsewhere)
LLAMA_BINARY = os.getenv("LLAMA_CPP_BINARY", "./llama.cpp/llama-cli.exe")

def run_llama(prompt: str, model_path: str, n_threads: int = 4, max_tokens: int = 512) -> Iterator[str]:
    """Run llama.cpp inference and yield token chunks.
    Args:
        prompt: User prompt.
        model_path: Path to GGML model file.
        n_threads: Number of threads for inference.
        max_tokens: Maximum tokens to generate.
    Yields:
        Strings containing incremental output.
    """
    if not os.path.isfile(LLAMA_BINARY):
        raise FileNotFoundError(f"Llama binary not found at {LLAMA_BINARY}")
    if not os.path.isfile(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")

    # Build command line for llama-cli
    cmd = [
        LLAMA_BINARY,
        "-m", model_path,
        "-p", prompt,
        "-n", str(max_tokens),
        "-t", str(n_threads),
        "--color", "false",  # no ANSI colors for parsing
    ]
    # Run subprocess, capture stdout line by line
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
    )
    # Yield each line as it arrives
    assert process.stdout is not None
    for line in iter(process.stdout.readline, ""):
        if line:
            yield line.rstrip("\n")
    process.wait()
    if process.returncode != 0:
        err = process.stderr.read() if process.stderr else ""
        raise RuntimeError(f"Llama inference failed (code {process.returncode}): {err}")
