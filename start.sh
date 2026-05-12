#!/bin/bash
ROOT="$HOME/proyectos/voxa"
echo "🎙  Voxa — iniciando..."

# Matar procesos anteriores
pkill -f "ts-node src/server" 2>/dev/null
pkill -f "expo start" 2>/dev/null
sleep 1

# Backend en background
cd "$ROOT/backend" && npx ts-node src/server.ts &
sleep 3

# Expo con iOS
cd "$ROOT" && npx expo start --ios
