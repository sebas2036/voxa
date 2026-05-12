#!/bin/bash
echo "🎙  Iniciando Voxa..."

ROOT=$(pwd)

pkill -f "ts-node src/server" 2>/dev/null
pkill -f "expo start" 2>/dev/null
sleep 1

echo "▶ Backend..."
cd "$ROOT/backend" && npx ts-node src/server.ts &
sleep 3

echo "▶ Expo..."
cd "$ROOT" && npx expo start --ios
