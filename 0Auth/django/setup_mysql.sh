#!/bin/bash

# MySQL Setup Script for Django OAuth Authentication
echo "🗄️ Setting up MySQL database for Django OAuth Authentication..."

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first:"
    echo "   sudo apt install mysql-server mysql-client"
    exit 1
fi

echo "✅ MySQL found: $(mysql --version)"

# Database configuration
DB_NAME="oauth_db"
DB_USER="oauth_user"
DB_PASSWORD="oauth_password123"

echo "📊 Creating MySQL database and user..."

# Create SQL commands
SQL_COMMANDS="
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
"

# Execute SQL commands
echo "🔧 Creating database: ${DB_NAME}"
echo "👤 Creating user: ${DB_USER}"
echo "🔑 Granting privileges..."

# Try to connect as root (will prompt for password)
echo "Please enter MySQL root password when prompted:"
mysql -u root -p << EOF
${SQL_COMMANDS}
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database and user created successfully!"
    
    # Update .env file with new credentials
    echo "📝 Updating .env file with new MySQL credentials..."
    
    cat > .env << EOF
# Django Configuration
DEBUG=True
SECRET_KEY=django-insecure-change-me-in-production-12345

# MySQL Database Configuration
DB_ENGINE=django.db.backends.mysql
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=localhost
DB_PORT=3306

# Encryption Key for OAuth Tokens
ENCRYPTION_KEY=your-encryption-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/accounts/oauth/google/callback/

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:8000/accounts/oauth/github/callback/

# Microsoft OAuth Configuration
MS_CLIENT_ID=your-microsoft-client-id
MS_CLIENT_SECRET=your-microsoft-client-secret
MS_TENANT_ID=common
MS_REDIRECT_URI=http://localhost:8000/accounts/oauth/microsoft/callback/

# Security Settings
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EOF
    
    echo "✅ .env file updated with MySQL credentials!"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Activate virtual environment: source venv/bin/activate"
    echo "2. Run migrations: python manage.py migrate"
    echo "3. Create superuser: python manage.py createsuperuser"
    echo "4. Start server: python manage.py runserver"
    echo ""
    echo "📊 Database Details:"
    echo "   Database: ${DB_NAME}"
    echo "   User: ${DB_USER}"
    echo "   Password: ${DB_PASSWORD}"
    echo "   Host: localhost"
    echo "   Port: 3306"
    
else
    echo "❌ Failed to create database. Please check your MySQL installation and root password."
    echo ""
    echo "🔧 Manual setup:"
    echo "1. Connect to MySQL as root: mysql -u root -p"
    echo "2. Run these commands:"
    echo "   CREATE DATABASE oauth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo "   CREATE USER 'oauth_user'@'localhost' IDENTIFIED BY 'oauth_password123';"
    echo "   GRANT ALL PRIVILEGES ON oauth_db.* TO 'oauth_user'@'localhost';"
    echo "   FLUSH PRIVILEGES;"
fi
