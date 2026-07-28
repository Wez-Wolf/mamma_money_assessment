#!/usr/bin/env bash
set -e

echo "Setting up Node.js..."
source ~/.nvm/nvm.sh
nvm use 22.22.3

echo "Building web assets..."
npx ionic build

echo "Running on Android..."
npx cap run android
