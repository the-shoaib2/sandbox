"""
Utility functions for OAuth authentication.
"""
import secrets
import string
import logging
import requests
from django.utils import timezone
from datetime import timedelta
from decouple import config

logger = logging.getLogger(__name__)


def generate_state(length=32):
    """
    Generate a secure random state parameter for OAuth.
    """
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def validate_state(received_state, stored_state):
    """
    Validate OAuth state parameter to prevent CSRF attacks.
    """
    if not received_state or not stored_state:
        return False
    return secrets.compare_digest(received_state, stored_state)


def refresh_oauth_token(provider, refresh_token):
    """
    Refresh OAuth access token using refresh token.
    """
    if not refresh_token:
        raise ValueError('Refresh token is required')
    
    refresh_configs = {
        'google': {
            'url': 'https://oauth2.googleapis.com/token',
            'data': {
                'client_id': config('GOOGLE_CLIENT_ID'),
                'client_secret': config('GOOGLE_CLIENT_SECRET'),
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token',
            }
        },
        'github': {
            # GitHub doesn't support refresh tokens for OAuth Apps
            # Only supports refresh tokens for GitHub Apps
            'url': None,
            'data': {}
        },
        'microsoft': {
            'url': f"https://login.microsoftonline.com/{config('MS_TENANT_ID')}/oauth2/v2.0/token",
            'data': {
                'client_id': config('MS_CLIENT_ID'),
                'client_secret': config('MS_CLIENT_SECRET'),
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token',
                'scope': 'openid email profile',
            }
        }
    }
    
    config_data = refresh_configs.get(provider)
    if not config_data or not config_data['url']:
        raise ValueError(f'Refresh tokens not supported for {provider}')
    
    response = requests.post(
        config_data['url'],
        data=config_data['data']
    )
    
    if response.status_code != 200:
        logger.error(f'Token refresh failed for {provider}: {response.text}')
        raise Exception(f'Token refresh failed: {response.text}')
    
    return response.json()


def revoke_oauth_token(provider, token):
    """
    Revoke OAuth token.
    """
    revoke_configs = {
        'google': {
            'url': 'https://oauth2.googleapis.com/revoke',
            'data': {'token': token}
        },
        'github': {
            'url': 'https://api.github.com/applications/{client_id}/token',
            'method': 'DELETE',
            'auth': (config('GITHUB_CLIENT_ID'), config('GITHUB_CLIENT_SECRET')),
            'data': {'access_token': token}
        },
        'microsoft': {
            'url': f"https://login.microsoftonline.com/{config('MS_TENANT_ID')}/oauth2/v2.0/logout",
            'params': {'post_logout_redirect_uri': config('MS_REDIRECT_URI')}
        }
    }
    
    config_data = revoke_configs.get(provider)
    if not config_data:
        logger.warning(f'Token revocation not implemented for {provider}')
        return
    
    try:
        if config_data.get('method') == 'DELETE':
            response = requests.delete(
                config_data['url'].format(client_id=config('GITHUB_CLIENT_ID')),
                auth=config_data['auth'],
                json=config_data['data']
            )
        else:
            response = requests.post(
                config_data['url'],
                data=config_data.get('data', {}),
                params=config_data.get('params', {})
            )
        
        if response.status_code not in [200, 204]:
            logger.warning(f'Token revocation failed for {provider}: {response.text}')
    
    except Exception as e:
        logger.error(f'Token revocation error for {provider}: {e}')


def get_oauth_provider_info(provider):
    """
    Get OAuth provider configuration information.
    """
    provider_info = {
        'google': {
            'name': 'Google',
            'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth',
            'token_url': 'https://oauth2.googleapis.com/token',
            'user_info_url': 'https://www.googleapis.com/oauth2/v2/userinfo',
            'scope': 'openid email profile',
            'supports_refresh': True,
            'icon': 'fab fa-google',
            'color': '#4285f4',
        },
        'github': {
            'name': 'GitHub',
            'auth_url': 'https://github.com/login/oauth/authorize',
            'token_url': 'https://github.com/login/oauth/access_token',
            'user_info_url': 'https://api.github.com/user',
            'scope': 'user:email',
            'supports_refresh': False,
            'icon': 'fab fa-github',
            'color': '#333333',
        },
        'microsoft': {
            'name': 'Microsoft',
            'auth_url': f"https://login.microsoftonline.com/{config('MS_TENANT_ID')}/oauth2/v2.0/authorize",
            'token_url': f"https://login.microsoftonline.com/{config('MS_TENANT_ID')}/oauth2/v2.0/token",
            'user_info_url': 'https://graph.microsoft.com/v1.0/me',
            'scope': 'openid email profile',
            'supports_refresh': True,
            'icon': 'fab fa-microsoft',
            'color': '#0078d4',
        }
    }
    
    return provider_info.get(provider, {})


def validate_oauth_config():
    """
    Validate OAuth configuration for all providers.
    """
    errors = []
    
    # Check Google OAuth config
    if not config('GOOGLE_CLIENT_ID', default=None):
        errors.append('GOOGLE_CLIENT_ID not configured')
    if not config('GOOGLE_CLIENT_SECRET', default=None):
        errors.append('GOOGLE_CLIENT_SECRET not configured')
    
    # Check GitHub OAuth config
    if not config('GITHUB_CLIENT_ID', default=None):
        errors.append('GITHUB_CLIENT_ID not configured')
    if not config('GITHUB_CLIENT_SECRET', default=None):
        errors.append('GITHUB_CLIENT_SECRET not configured')
    
    # Check Microsoft OAuth config
    if not config('MS_CLIENT_ID', default=None):
        errors.append('MS_CLIENT_ID not configured')
    if not config('MS_CLIENT_SECRET', default=None):
        errors.append('MS_CLIENT_SECRET not configured')
    if not config('MS_TENANT_ID', default=None):
        errors.append('MS_TENANT_ID not configured')
    
    return errors


def cleanup_expired_tokens():
    """
    Clean up expired OAuth tokens from database.
    """
    from .models import OAuthAccount
    
    expired_accounts = OAuthAccount.objects.filter(
        expires_at__lt=timezone.now()
    )
    
    count = expired_accounts.count()
    if count > 0:
        logger.info(f'Cleaning up {count} expired OAuth tokens')
        expired_accounts.update(
            access_token='',
            refresh_token='',
            id_token=''
        )
    
    return count


def get_user_oauth_providers(user):
    """
    Get list of OAuth providers connected to a user.
    """
    return list(user.oauth_accounts.values_list('provider', flat=True))


def is_oauth_user(user):
    """
    Check if user has any OAuth accounts.
    """
    return user.oauth_accounts.exists()


def merge_oauth_accounts(user, duplicate_user):
    """
    Merge OAuth accounts from duplicate user to main user.
    """
    from .models import OAuthAccount, UserProfile
    
    # Transfer OAuth accounts
    OAuthAccount.objects.filter(user=duplicate_user).update(user=user)
    
    # Transfer profile if main user doesn't have one
    if not hasattr(user, 'profile') and hasattr(duplicate_user, 'profile'):
        duplicate_user.profile.user = user
        duplicate_user.profile.save()
    
    # Delete duplicate user
    duplicate_user.delete()
    
    logger.info(f'Merged OAuth accounts from {duplicate_user.email} to {user.email}')


def generate_pkce_pair():
    """
    Generate PKCE code verifier and challenge for OAuth 2.0.
    """
    import base64
    import hashlib
    
    # Generate code verifier
    code_verifier = secrets.token_urlsafe(32)
    
    # Generate code challenge
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).decode().rstrip('=')
    
    return code_verifier, code_challenge
