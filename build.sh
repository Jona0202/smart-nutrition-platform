#!/usr/bin/env bash
# Build script for Render deployment
# This builds both the React frontend and installs Python backend deps

set -e

echo "=== Installing Python dependencies ==="
cd backend
pip install -r requirements.txt

echo "=== Installing Node.js dependencies ==="
cd ../frontend
npm ci

echo "=== Building React frontend ==="
npm run build

echo "=== Copying frontend build to backend/static ==="
cd ..
rm -rf backend/static
cp -r frontend/dist backend/static

echo "=== Build complete! ==="
ls -la backend/static/
