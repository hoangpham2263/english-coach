#!/bin/bash
# Opens English Coach on macOS (Node 22+). Close this Terminal window to stop the app.
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
command -v node >/dev/null || { echo "Cần cài Node.js 22+: https://nodejs.org"; read -r -p "Nhấn Enter để đóng."; exit 1; }
exec node src/server.mjs "$@"
