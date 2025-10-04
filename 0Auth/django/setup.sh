#!/bin/bash

# Django OAuth Authentication Setup Script
echo "🚀 Setting up Django OAuth Authentication System..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Copy environment file
echo "⚙️ Setting up environment variables..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Created .env file from env.example"
    echo "⚠️  Please edit .env file with your OAuth provider credentials"
else
    echo "✅ .env file already exists"
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Run Django migrations
echo "🗄️ Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Collect static files
echo "🎨 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser (optional)
echo "👤 Would you like to create a superuser? (y/n)"
read -r create_superuser
if [ "$create_superuser" = "y" ] || [ "$create_superuser" = "Y" ]; then
    python manage.py createsuperuser
fi

echo "✅ Setup completed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Edit .env file with your OAuth provider credentials"
echo "2. Run: python manage.py runserver"
echo "3. Visit: http://localhost:8000"
echo ""
echo "📖 For OAuth setup instructions, see: OAUTH_SETUP_GUIDE.md"
