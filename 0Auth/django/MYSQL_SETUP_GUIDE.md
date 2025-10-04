# MySQL Setup Guide for Django OAuth Authentication

## 🗄️ MySQL Database Configuration Complete!

Your Django OAuth system is now configured to use MySQL. Here's everything you need to know:

## 📋 Current Configuration

### ✅ What's Already Done
- ✅ PyMySQL installed (pure Python MySQL client)
- ✅ Django settings configured for MySQL
- ✅ Environment variables set up
- ✅ Database configuration in settings.py
- ✅ Setup scripts created

### 📁 Files Created/Updated
- `requirements.txt` - Added PyMySQL==1.1.2
- `config/settings.py` - MySQL database configuration
- `.env` - MySQL connection parameters
- `setup_mysql.sh` - Automated MySQL setup script
- `MYSQL_SCHEMA.sql` - Manual database creation script

## 🚀 Quick Setup Options

### Option 1: Automated Setup (Recommended)
```bash
cd /home/the-shoaib/Desktop/sandbox/0Auth/django
./setup_mysql.sh
```

### Option 2: Manual MySQL Setup

#### 1. Install MySQL Server
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server mysql-client

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

#### 2. Create Database and User
```bash
# Connect to MySQL as root
sudo mysql -u root -p

# Run these SQL commands:
CREATE DATABASE oauth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'oauth_user'@'localhost' IDENTIFIED BY 'oauth_password123';
GRANT ALL PRIVILEGES ON oauth_db.* TO 'oauth_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Update Environment Variables
The `.env` file is already configured with:
```bash
DB_ENGINE=django.db.backends.mysql
DB_NAME=oauth_db
DB_USER=oauth_user
DB_PASSWORD=oauth_password123
DB_HOST=localhost
DB_PORT=3306
```

### Option 3: Use Existing MySQL Server
If you have MySQL running elsewhere, update the `.env` file:
```bash
DB_HOST=your-mysql-host
DB_PORT=your-mysql-port
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
```

## 🔧 Django Commands

Once MySQL is running, execute these commands:

```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Test MySQL connection
python manage.py check --database default

# 3. Create migrations
python manage.py makemigrations

# 4. Apply migrations to MySQL
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. Start development server
python manage.py runserver
```

## 🗄️ Database Schema

### Expected Tables After Migration:
- `users` - Custom user model
- `oauth_accounts` - OAuth provider accounts
- `user_profiles` - Extended user profiles
- `auth_*` - Django authentication tables
- `django_*` - Django system tables
- `account_*` - Django allauth tables
- `socialaccount_*` - OAuth provider tables

### Verify Database:
```sql
-- Connect to MySQL
mysql -u oauth_user -p oauth_db

-- Show all tables
SHOW TABLES;

-- Check user table structure
DESCRIBE users;

-- Check OAuth accounts table
DESCRIBE oauth_accounts;
```

## 🔍 Troubleshooting

### Common Issues:

#### 1. "Connection refused" Error
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql

# Check MySQL port
sudo netstat -tlnp | grep :3306
```

#### 2. "Access denied" Error
```bash
# Reset MySQL root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'newpassword';
FLUSH PRIVILEGES;
```

#### 3. "Database doesn't exist" Error
```bash
# Create database manually
mysql -u root -p
CREATE DATABASE oauth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 4. PyMySQL Import Error
```bash
# Reinstall PyMySQL
pip uninstall PyMySQL
pip install PyMySQL==1.1.2
```

## 🔒 Security Considerations

### Production Settings:
```python
# In settings.py for production
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'oauth_db',
        'USER': 'oauth_user',
        'PASSWORD': 'strong_password_here',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
            'ssl': {'ca': '/path/to/ca-cert.pem'},
        },
    }
}
```

### MySQL Security:
```sql
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Remove test database
DROP DATABASE IF EXISTS test;

-- Restart MySQL
FLUSH PRIVILEGES;
```

## 📊 Database Configuration Details

### Current .env Configuration:
```bash
# MySQL Database Configuration
DB_ENGINE=django.db.backends.mysql
DB_NAME=oauth_db
DB_USER=oauth_user
DB_PASSWORD=oauth_password123
DB_HOST=localhost
DB_PORT=3306
```

### Django Settings Features:
- UTF8MB4 character set for full Unicode support
- Strict SQL mode for data integrity
- PyMySQL as MySQL client (no compilation required)
- Proper connection pooling
- Transaction support

## 🎯 Next Steps

1. **Install MySQL Server** (if not already installed)
2. **Run the setup script**: `./setup_mysql.sh`
3. **Test the connection**: `python manage.py check`
4. **Run migrations**: `python manage.py migrate`
5. **Start development**: `python manage.py runserver`

## 📞 Support

If you encounter issues:

1. **Check MySQL status**: `sudo systemctl status mysql`
2. **Verify connection**: `mysql -u oauth_user -p oauth_db`
3. **Check Django logs**: `tail -f logs/django.log`
4. **Review error messages**: Look for specific error details

## 🎉 You're Ready!

Once MySQL is running, your Django OAuth system will use MySQL as the database backend with full OAuth authentication support!

**Database**: `oauth_db`  
**User**: `oauth_user`  
**Tables**: Auto-created by Django migrations  
**Features**: Full OAuth with encrypted token storage
