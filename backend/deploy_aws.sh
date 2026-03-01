#!/bin/bash

# SmartDine AWS Deployment Script (Amazon Linux 2023)
# This script installs Python, Git, and sets up the FastAPI environment.

echo "🚀 Starting SmartDine Setup..."

# 1. Update system
sudo dnf update -y

# 2. Install Python 3.11 and Git
sudo dnf install -y python3.11 python3.11-pip git

# 3. Clone repository
REPO_URL="https://github.com/arulkumarank/SmartDineMobile.git"
PROJECT_DIR="SmartDineMobile"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "📥 Cloning repository..."
    git clone $REPO_URL
else
    echo "🔄 Repository already exists, pulling updates..."
    cd $PROJECT_DIR && git pull && cd ..
fi

cd $PROJECT_DIR/backend

# 4. Create virtual environment
echo "🐍 Creating virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# 5. Install dependencies
echo "📦 Installing requirements..."
pip install --upgrade pip
pip install -r requirements.txt

# 6. Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating template .env file..."
    cp .env.example .env 2>/dev/null || touch .env
    echo "⚠️ REMINDER: Edit backend/.env with your MongoDB and Groq keys!"
fi

# 7. Start the server (using screen to keep it running)
echo "🔥 Starting FastAPI server on port 8000..."
sudo dnf install -y screen

# Run in a detached screen session
screen -dmS smartdine_api bash -c "source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000"

echo "✅ Setup Complete!"
echo "📡 API should now be running at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000"
echo "👉 Use 'screen -r smartdine_api' to see the server logs."
