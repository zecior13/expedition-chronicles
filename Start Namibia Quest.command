#!/bin/zsh

set -u

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR" || exit 1

BASE_PORT=8091
PORT="$BASE_PORT"

while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [ -z "$IP" ]; then
  IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
fi

LOCAL_URL="http://localhost:${PORT}"
PHONE_URL=""

clear
echo "Namibia Quest - lokalny serwer testowy"
echo "--------------------------------------"
echo ""
echo "Projekt:"
echo "$PROJECT_DIR"
echo ""
echo "Mac:"
echo "$LOCAL_URL"
echo ""

if [ -n "$IP" ]; then
  PHONE_URL="http://${IP}:${PORT}"
  echo "iPhone w tej samej sieci Wi-Fi:"
  echo "$PHONE_URL"
  echo "$PHONE_URL" | pbcopy
  echo ""
  echo "Adres dla telefonu zostal skopiowany do schowka."
else
  echo "Nie udalo sie automatycznie odczytac adresu IP Wi-Fi."
  echo "Sprawdz go recznie: ipconfig getifaddr en0"
fi

echo ""
echo "Adres GitHub Pages po wypchnieciu zmian:"
echo "https://zecior13.github.io/expedition-chronicles/"
echo ""
echo "Nie zamykaj tego okna, dopoki testujesz lokalnie."
echo "Aby zatrzymac serwer: Ctrl+C albo zamknij okno."
echo ""

open "$LOCAL_URL"

python3 -m http.server "$PORT" --bind 0.0.0.0
