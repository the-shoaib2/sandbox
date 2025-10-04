# Django OAuth Authentication System

A complete Django OAuth authentication system supporting Google, GitHub, and Microsoft OAuth providers with encrypted token storage and comprehensive security features.

## Features

- **Multi-Provider OAuth**: Support for Google, GitHub, and Microsoft
- **Secure Token Storage**: Encrypted OAuth tokens using Fernet encryption
- **Custom User Model**: Extended user model with OAuth account linking
- **Responsive UI**: Modern Bootstrap-based interface
- **Security Best Practices**: CSRF protection, PKCE, state parameter validation
- **Token Management**: Automatic token refresh and expiration handling
- **Admin Interface**: Comprehensive admin panel for user and OAuth management
- **API Endpoints**: RESTful API for token management
- **Production Ready**: Comprehensive logging, error handling, and monitoring

## Quick Start

### 1. Clone and Setup

```bash
cd django-oauth-auth
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
cp env.example .env
# Edit .env with your OAuth provider credentials
```

### 3. Database Setup

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 4. Run Development Server

```bash
python manage.py runserver
```

Visit `http://localhost:8000` to see the OAuth login page.

## Project Structure

```
django-oauth-auth/
├── config/                 # Django project configuration
│   ├── settings.py        # Main settings file
│   ├── urls.py           # URL configuration
│   ├── wsgi.py           # WSGI configuration
│   └── asgi.py           # ASGI configuration
├── accounts/              # Main authentication app
│   ├── models.py         # User and OAuth models
│   ├── views.py          # Authentication views
│   ├── forms.py          # User forms
│   ├── urls.py           # App URL configuration
│   ├── utils.py          # OAuth utilities
│   ├── signals.py        # Django signals
│   ├── admin.py          # Admin configuration
│   └── migrations/       # Database migrations
├── templates/             # HTML templates
│   ├── base.html         # Base template
│   └── accounts/         # Account templates
├── static/               # Static files
│   ├── css/              # CSS stylesheets
│   └── js/               # JavaScript files
├── manage.py             # Django management script
├── requirements.txt      # Python dependencies
├── env.example          # Environment variables template
├── SQL_SCHEMA.md        # Database schema documentation
└── OAUTH_SETUP_GUIDE.md # OAuth provider setup guide
```

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Encrypted password
- `is_active`: Account status
- `is_verified`: Email verification status
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### OAuth Accounts Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `provider`: OAuth provider (google/github/microsoft)
- `provider_account_id`: Provider-specific user ID
- `access_token`: Encrypted access token
- `refresh_token`: Encrypted refresh token
- `id_token`: Encrypted ID token
- `expires_at`: Token expiration timestamp
- `scope`: OAuth scope permissions
- `created_at`: Account linking timestamp
- `updated_at`: Last update timestamp

## OAuth Provider Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:8000/accounts/oauth/google/callback/`
4. Update environment variables:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/accounts/oauth/google/callback/
   ```

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set callback URL: `http://localhost:8000/accounts/oauth/github/callback/`
4. Update environment variables:
   ```bash
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   GITHUB_REDIRECT_URI=http://localhost:8000/accounts/oauth/github/callback/
   ```

### Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register new application
3. Add redirect URI: `http://localhost:8000/accounts/oauth/microsoft/callback/`
4. Update environment variables:
   ```bash
   MS_CLIENT_ID=your-client-id
   MS_CLIENT_SECRET=your-client-secret
   MS_TENANT_ID=common
   MS_REDIRECT_URI=http://localhost:8000/accounts/oauth/microsoft/callback/
   ```

## Security Features

### Token Encryption
- All OAuth tokens are encrypted at rest using Fernet encryption
- Encryption key is configurable via environment variable
- Automatic key generation with warning if not set

### CSRF Protection
- State parameter validation prevents CSRF attacks
- PKCE (Proof Key for Code Exchange) implementation
- Secure session management

### Token Management
- Automatic token expiration checking
- Token refresh functionality
- Secure token revocation on logout

## API Endpoints

### Authentication Endpoints
- `GET /accounts/oauth/{provider}/login/` - Initiate OAuth login
- `GET /accounts/oauth/{provider}/callback/` - Handle OAuth callback
- `GET /accounts/oauth/{provider}/disconnect/` - Disconnect OAuth account

### API Endpoints
- `POST /accounts/api/refresh-token/` - Refresh OAuth tokens

### Example API Usage

```javascript
// Refresh OAuth token
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

## Configuration

### Environment Variables

```bash
# Django Configuration
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/oauth_db

# Encryption
ENCRYPTION_KEY=your-encryption-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/accounts/oauth/google/callback/

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:8000/accounts/oauth/github/callback/

MS_CLIENT_ID=your-microsoft-client-id
MS_CLIENT_SECRET=your-microsoft-client-secret
MS_TENANT_ID=common
MS_REDIRECT_URI=http://localhost:8000/accounts/oauth/microsoft/callback/
```

### Django Settings

Key settings in `config/settings.py`:

```python
# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# OAuth Configuration
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'offline'},
        'OAUTH_PKCE_ENABLED': True,
    },
    'github': {
        'SCOPE': ['user', 'email'],
    },
    'microsoft': {
        'TENANT': 'common',
        'SCOPE': ['openid', 'email', 'profile'],
    },
}
```

## Testing

### Manual Testing

1. **Test OAuth Login**:
   - Visit the home page
   - Click on OAuth provider buttons
   - Complete authentication flow
   - Verify user creation and profile data

2. **Test Token Management**:
   - Login with OAuth provider
   - Check token expiration
   - Test token refresh functionality
   - Test logout and token revocation

3. **Test User Profile**:
   - Update profile information
   - Connect additional OAuth accounts
   - Disconnect OAuth accounts
   - Verify profile display

### Automated Testing

```bash
python manage.py test accounts
```

## Production Deployment

### 1. Security Configuration

```python
# Production settings
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

### 2. Database Migration

```bash
python manage.py migrate --settings=config.settings.production
```

### 3. Static Files

```bash
python manage.py collectstatic --settings=config.settings.production
```

### 4. OAuth Provider Configuration

Update all OAuth provider redirect URIs to use your production domain:
- `https://yourdomain.com/accounts/oauth/google/callback/`
- `https://yourdomain.com/accounts/oauth/github/callback/`
- `https://yourdomain.com/accounts/oauth/microsoft/callback/`

## Monitoring and Logging

### Log Configuration

The system includes comprehensive logging:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/django.log',
        },
    },
    'loggers': {
        'accounts': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
```

### Monitoring Points

- OAuth authentication attempts
- Token refresh operations
- User registration and login events
- Token expiration and cleanup
- Security-related events

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**
   - Ensure URIs match exactly in OAuth provider settings
   - Check for trailing slashes
   - Verify protocol (http vs https)

2. **Token Expired**
   - Check token expiration times
   - Implement token refresh logic
   - Monitor token cleanup processes

3. **Database Connection**
   - Verify database credentials
   - Check database server status
   - Review connection string format

4. **Encryption Issues**
   - Ensure encryption key is set
   - Check key format and length
   - Verify encryption/decryption functions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review Django logs for error messages
3. Verify OAuth provider configuration
4. Test with OAuth provider's testing tools

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
