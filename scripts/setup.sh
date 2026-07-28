#!/bin/bash
# ==============================================================================
# Doctors Vedika - Enterprise Automated Environment Setup Script
# ==============================================================================

set -e

echo "🚀 Starting Doctors Vedika Workspace Setup..."

# 1. Frontend Setup
echo "📱 Setting up Frontend (React Native Expo)..."
cd "$(dirname "$0")/../frontend"
if [ -f "package.json" ]; then
    npm install --legacy-peer-deps
    echo "✅ Frontend dependencies installed."
fi

# 2. Backend Setup
echo "⚙️ Setting up Backend API Service..."
cd "../backend"
if [ -f "package.json" ]; then
    npm install
    echo "✅ Backend dependencies installed."
fi

# 3. AI Services Setup
echo "🧠 Setting up AI Services (Python)..."
cd "../ai-services"
if [ -f "requirements.txt" ]; then
    if command -v python3 &> /dev/null; then
        python3 -m venv venv || true
        echo "✅ Python virtual environment created."
    fi
fi

echo "======================================================"
echo "🎉 Doctors Vedika Enterprise Environment Ready!"
echo "======================================================"
