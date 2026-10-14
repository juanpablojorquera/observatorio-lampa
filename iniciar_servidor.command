#!/bin/bash
# Script de inicio rápido para macOS
cd "$(dirname "$0")"
echo "=========================================================="
echo " Observatorio de Población Validada FONASA 2026 - 2027"
echo " Red de Salud Municipal de Lampa | APS"
echo "=========================================================="
PORT=8080
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PORT=8081
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        PORT=8082
    fi
fi

echo "Iniciando servidor web local en puerto $PORT..."

python3 -m http.server $PORT --bind 127.0.0.1 &
SERVER_PID=$!

sleep 1
open "http://127.0.0.1:$PORT/index.html?v=$(date +%s)"

echo ""
echo "Dashboard disponible en: http://127.0.0.1:$PORT"
echo "Presiona Ctrl+C para detener el servidor web."
echo "=========================================================="

wait $SERVER_PID
