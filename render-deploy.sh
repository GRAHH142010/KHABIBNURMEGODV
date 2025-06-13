#!/bin/bash
# Render deployment preparation script
set -e

echo "Starting Render deployment preparation..."

# Environment validation
echo "Validating environment variables..."
if [ -z "$NODE_ENV" ]; then
  echo "Warning: NODE_ENV not set, defaulting to production"
  export NODE_ENV=production
fi

# Required variables check
REQUIRED_VARS=("DPS_USERNAME" "DPS_PASSWORD" "GMAIL_EMAIL" "GMAIL_APP_PASSWORD")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo "Error: Missing required environment variables: ${MISSING_VARS[*]}"
  echo "Set these in Render dashboard before deployment"
  exit 1
fi

echo "All required environment variables are set"

# Clean previous builds
echo "Cleaning previous build artifacts..."
rm -rf dist/
rm -rf node_modules/.cache/
rm -rf client/node_modules/

# Install dependencies
echo "Installing dependencies..."
npm ci --only=production

# Build application
echo "Building frontend..."
npm run build:frontend

echo "Building backend..."
npm run build:backend

# Verify build outputs
if [ ! -f "dist/index.prod.js" ]; then
  echo "Error: Backend build failed - dist/index.prod.js not found"
  exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
  echo "Error: Frontend build failed - dist/public/index.html not found"
  exit 1
fi

echo "Build completed successfully!"
echo "Backend: dist/index.prod.js"
echo "Frontend: dist/public/"
echo "Ready for Render deployment"