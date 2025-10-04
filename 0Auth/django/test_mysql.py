#!/usr/bin/env python
"""
MySQL Connection Test Script for Django OAuth Authentication
"""

import os
import sys
import django
from pathlib import Path

# Add project root to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

def test_mysql_connection():
    """Test MySQL connection using Django database configuration."""
    try:
        # Setup Django
        django.setup()
        
        # Import Django database modules
        from django.db import connection
        from django.core.management.color import no_style
        from django.core.management.sql import sql_create_index
        
        print("🔍 Testing MySQL Connection...")
        print("=" * 50)
        
        # Test database connection
        with connection.cursor() as cursor:
            # Test basic connection
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"✅ Basic connection test: {result}")
            
            # Get database info
            cursor.execute("SELECT DATABASE()")
            db_name = cursor.fetchone()[0]
            print(f"📊 Connected to database: {db_name}")
            
            # Get MySQL version
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()[0]
            print(f"🗄️ MySQL version: {version}")
            
            # Check character set
            cursor.execute("SELECT @@character_set_database")
            charset = cursor.fetchone()[0]
            print(f"🔤 Character set: {charset}")
            
            # List existing tables
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            if tables:
                print(f"📋 Existing tables: {len(tables)}")
                for table in tables:
                    print(f"   - {table[0]}")
            else:
                print("📋 No tables found (will be created by Django migrations)")
        
        print("\n🎉 MySQL connection test successful!")
        print("\n📝 Next steps:")
        print("1. Run: python manage.py makemigrations")
        print("2. Run: python manage.py migrate")
        print("3. Run: python manage.py createsuperuser")
        print("4. Run: python manage.py runserver")
        
        return True
        
    except Exception as e:
        print(f"\n❌ MySQL connection test failed!")
        print(f"Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check if MySQL server is running:")
        print("   sudo systemctl status mysql")
        print("2. Start MySQL if not running:")
        print("   sudo systemctl start mysql")
        print("3. Check your .env file database credentials")
        print("4. Run the setup script:")
        print("   ./setup_mysql.sh")
        return False

def test_django_config():
    """Test Django configuration without database connection."""
    try:
        print("🔧 Testing Django Configuration...")
        print("=" * 50)
        
        # Setup Django
        django.setup()
        
        from django.conf import settings
        from django.db import connections
        
        # Check database configuration
        db_config = settings.DATABASES['default']
        print(f"🗄️ Database Engine: {db_config['ENGINE']}")
        print(f"📊 Database Name: {db_config['NAME']}")
        print(f"👤 Database User: {db_config['USER']}")
        print(f"🏠 Database Host: {db_config['HOST']}")
        print(f"🔌 Database Port: {db_config['PORT']}")
        
        # Check PyMySQL installation
        try:
            import pymysql
            print(f"✅ PyMySQL version: {pymysql.__version__}")
        except ImportError:
            print("❌ PyMySQL not installed")
            return False
        
        # Check Django apps
        apps = settings.INSTALLED_APPS
        oauth_apps = [app for app in apps if 'oauth' in app.lower() or 'auth' in app.lower()]
        print(f"📱 OAuth-related apps: {len(oauth_apps)}")
        for app in oauth_apps:
            print(f"   - {app}")
        
        print("\n✅ Django configuration test successful!")
        return True
        
    except Exception as e:
        print(f"\n❌ Django configuration test failed!")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Django OAuth MySQL Connection Test")
    print("=" * 60)
    
    # Test Django configuration first
    config_ok = test_django_config()
    
    if config_ok:
        print("\n" + "=" * 60)
        # Test MySQL connection
        connection_ok = test_mysql_connection()
        
        if connection_ok:
            print("\n🎉 All tests passed! MySQL is ready for Django OAuth.")
        else:
            print("\n⚠️ Django is configured but MySQL connection failed.")
            print("Please check your MySQL setup and try again.")
    else:
        print("\n❌ Django configuration issues detected.")
        print("Please fix the configuration before testing MySQL connection.")
