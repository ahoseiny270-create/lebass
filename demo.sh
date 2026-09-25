#!/bin/bash
# MODERA one-click demo launcher (Mac / Linux)
cd "$(dirname "$0")"
echo "============================================"
echo "  MODERA - در حال اجرای نسخه نمایشی..."
echo "============================================"
python3 -m http.server 8000 --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
sleep 1.5
(xdg-open http://localhost:8000 2>/dev/null || open http://localhost:8000 2>/dev/null || echo "مرورگر را باز کن: http://localhost:8000")
echo ""
echo "  دمو اجرا شد! http://localhost:8000"
echo "  برای توقف، Ctrl+C را بزن."
echo ""
wait $SRV
