# OAuth Provider Setup Guide

This guide will walk you through setting up OAuth authentication with Google, GitHub, and Microsoft for your Django application.

## Prerequisites

- Django project with the OAuth authentication system
- Python virtual environment
- Database (PostgreSQL recommended for production)
- Domain name (for production) or localhost (for development)

## Environment Setup

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Generate encryption key:**
   ```python
   from cryptography.fernet import Fernet
   print(Fernet.generate_key().decode())
   ```

3. **Update .env file with your values:**
   ```bash
   # Generate a secret key
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)

### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - Development: `http://localhost:8000/accounts/oauth/google/callback/`
   - Production: `https://yourdomain.com/accounts/oauth/google/callback/`

### Step 3: Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Choose **External** for public apps or **Internal** for G Suite
3. Fill in required fields:
   - App name: Your application name
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`

### Step 4: Update Environment Variables

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/accounts/oauth/google/callback/
```

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the form:
   - **Application name**: Your application name
   - **Homepage URL**: Your website URL
   - **Authorization callback URL**: 
     - Development: `http://localhost:8000/accounts/oauth/github/callback/`
     - Production: `https://yourdomain.com/accounts/oauth/github/callback/`

### Step 2: Get Client Credentials

1. After creating the app, you'll see **Client ID** and **Client Secret**
2. Copy these values

### Step 3: Update Environment Variables

```bash
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:8000/accounts/oauth/github/callback/
```

## Microsoft OAuth Setup

### Step 1: Register Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in the form:
   - **Name**: Your application name
   - **Supported account types**: Choose based on your needs
   - **Redirect URI**: 
     - Development: `http://localhost:8000/accounts/oauth/microsoft/callback/`
     - Production: `https://yourdomain.com/accounts/oauth/microsoft/callback/`

### Step 2: Configure API Permissions

1. Go to **API permissions**
2. Add permissions:
   - **Microsoft Graph** → **Delegated permissions**:
     - `openid`
     - `email`
     - `profile`
3. Grant admin consent if required

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description and expiration
4. Copy the secret value immediately (you won't see it again)

### Step 4: Update Environment Variables

```bash
MS_CLIENT_ID=your-microsoft-client-id
MS_CLIENT_SECRET=your-microsoft-client-secret
MS_TENANT_ID=common  # or your specific tenant ID
MS_REDIRECT_URI=http://localhost:8000/accounts/oauth/microsoft/callback/
```

## Database Setup

### PostgreSQL (Recommended)

```sql
CREATE DATABASE oauth_db;
CREATE USER oauth_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE oauth_db TO oauth_user;
```

Update your `.env` file:
```bash
DATABASE_URL=postgresql://oauth_user:your_password@localhost:5432/oauth_db
```

### SQLite (Development)

```bash
DATABASE_URL=sqlite:///db.sqlite3
```

## Django Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser

```bash
python manage.py createsuperuser
```

### 4. Collect Static Files

```bash
python manage.py collectstatic
```

### 5. Run Development Server

```bash
python manage.py runserver
```

## Testing OAuth Integration

### 1. Test Google OAuth

1. Navigate to `http://localhost:8000/`
2. Click "Continue with Google"
3. Complete Google authentication
4. Verify user creation and profile data

### 2. Test GitHub OAuth

1. Click "Continue with GitHub"
2. Complete GitHub authentication
3. Verify user creation and profile data

### 3. Test Microsoft OAuth

1. Click "Continue with Microsoft"
2. Complete Microsoft authentication
3. Verify user creation and profile data

## Security Best Practices

### 1. Environment Variables

- Never commit `.env` file to version control
- Use different credentials for development and production
- Rotate secrets regularly

### 2. HTTPS in Production

- Always use HTTPS in production
- Update redirect URIs to use HTTPS
- Enable HSTS headers

### 3. Token Security

- Tokens are encrypted at rest using Fernet encryption
- Refresh tokens are securely stored
- Implement token expiration monitoring

### 4. CSRF Protection

- State parameter prevents CSRF attacks
- PKCE (Proof Key for Code Exchange) is implemented for public clients

### 5. Rate Limiting

- Implement rate limiting for OAuth endpoints
- Monitor for suspicious activity
- Log authentication attempts

## Production Deployment

### 1. Update Settings

```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

### 2. Update OAuth Redirect URIs

Update all OAuth provider redirect URIs to use your production domain:
- `https://yourdomain.com/accounts/oauth/google/callback/`
- `https://yourdomain.com/accounts/oauth/github/callback/`
- `https://yourdomain.com/accounts/oauth/microsoft/callback/`

### 3. Database Migration

```bash
python manage.py migrate --settings=config.settings.production
```

### 4. Static Files

```bash
python manage.py collectstatic --settings=config.settings.production
```

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**
   - Ensure redirect URIs match exactly in OAuth provider settings
   - Check for trailing slashes
   - Verify protocol (http vs https)

2. **Token Expired**
   - Implement token refresh logic
   - Monitor token expiration times
   - Handle refresh token rotation

3. **User Creation Issues**
   - Check email field requirements
   - Verify user model configuration
   - Review OAuth provider response data

4. **Database Connection**
   - Verify database credentials
   - Check database server status
   - Review connection string format

### Debug Mode

Enable debug logging in development:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'accounts': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

## API Endpoints

### OAuth Endpoints

- `GET /accounts/oauth/{provider}/login/` - Initiate OAuth login
- `GET /accounts/oauth/{provider}/callback/` - Handle OAuth callback
- `GET /accounts/oauth/{provider}/disconnect/` - Disconnect OAuth account

### API Endpoints

- `POST /accounts/api/refresh-token/` - Refresh OAuth tokens

### Example API Usage

```javascript
// Refresh token
fetch('/accounts/api/refresh-token/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({
        provider: 'google'
    })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Token refreshed successfully');
    }
});
```

## Monitoring and Analytics

### 1. Log Monitoring

Monitor authentication logs for:
- Failed login attempts
- Token refresh failures
- OAuth provider errors

### 2. User Analytics

Track:
- OAuth provider usage
- User registration patterns
- Session duration

### 3. Security Monitoring

Implement:
- Rate limiting
- Suspicious activity detection
- Failed authentication alerts

## Support

For issues and questions:

1. Check Django logs for error messages
2. Verify OAuth provider configuration
3. Test with OAuth provider's testing tools
4. Review Django OAuth documentation

## Additional Resources

- [Django OAuth Documentation](https://docs.djangoproject.com/en/stable/topics/auth/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
