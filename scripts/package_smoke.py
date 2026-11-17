"""Smoke-test a packaged Tkinter executable without leaking GUI child processes.

PyInstaller onefile on Windows can spawn a child which inherits stdout/stderr
handles. Never pipe those handles: terminating the parent and waiting for pipe
EOF can hang when the GUI child remains alive. This is a process-liveness check,
not an interactive acceptance test.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("executable", type=Path)
    parser.add_argument("--seconds", type=float, default=5.0)
    args = parser.parse_args()
    if args.seconds <= 0:
        parser.error("--seconds must be positive")
    binary = args.executable.resolve()
    if not binary.is_file():
        parser.error(f"Missing packaged executable: {binary}")

    # Prevent inherited pipe descriptors from keeping communicate() blocked.
    proc = subprocess.Popen([str(binary)], stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL)
    try:
        deadline = time.monotonic() + args.seconds
        while time.monotonic() < deadline:
            if proc.poll() is not None:
                print(f"Packaged GUI exited early (code {proc.returncode})", file=sys.stderr)
                return 1
            time.sleep(0.2)
        if proc.poll() is not None:
            print(f"Packaged GUI exited early (code {proc.returncode})", file=sys.stderr)
            return 1
        print(f"Packaged GUI remained running for {args.seconds:.1f} seconds: {binary.name}")
        return 0
    finally:
        if proc.poll() is None:
            if sys.platform == "win32":
                subprocess.run(["taskkill", "/T", "/F", "/PID", str(proc.pid)],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                               timeout=15, check=False)
            else:
                proc.terminate()
            try:
                proc.wait(timeout=8)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait(timeout=8)


if __name__ == "__main__":
    raise SystemExit(main())
