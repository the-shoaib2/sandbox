"""
Views for user authentication and OAuth handling.
"""
import requests
import logging
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.urls import reverse
from django.conf import settings
from decouple import config
from .models import User, OAuthAccount, UserProfile
from .forms import UserProfileForm
from .utils import generate_state, validate_state, refresh_oauth_token

logger = logging.getLogger(__name__)


class HomeView(TemplateView):
    """
    Home page with OAuth login options.
    """
    template_name = 'accounts/home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context


class ProfileView(TemplateView):
    """
    User profile page.
    """
    template_name = 'accounts/profile.html'
    
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['oauth_accounts'] = self.request.user.oauth_accounts.all()
        context['profile'] = getattr(self.request.user, 'profile', None)
        return context


@login_required
def update_profile(request):
    """
    Update user profile.
    """
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')
    else:
        form = UserProfileForm(instance=profile)
    
    return render(request, 'accounts/update_profile.html', {'form': form})


def oauth_login(request, provider):
    """
    Initiate OAuth login for specified provider.
    """
    # Generate state parameter for CSRF protection
    state = generate_state()
    request.session[f'oauth_state_{provider}'] = state
    
    # Define OAuth URLs and parameters
    oauth_configs = {
        'google': {
            'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth',
            'client_id': config('GOOGLE_CLIENT_ID'),
            'redirect_uri': config('GOOGLE_REDIRECT_URI'),
            'scope': 'openid email profile',
            'response_type': 'code',
        },
        'github': {
            'auth_url': 'https://github.com/login/oauth/authorize',
            'client_id': config('GITHUB_CLIENT_ID'),
            'redirect_uri': config('GITHUB_REDIRECT_URI'),
            'scope': 'user:email',
            'response_type': 'code',
        },
        'microsoft': {
            'auth_url': f"https://login.microsoftonline.com/{config('MS_TENANT_ID')}/oauth2/v2.0/authorize",
            'client_id': config('MS_CLIENT_ID'),
            'redirect_uri': config('MS_REDIRECT_URI'),
            'scope': 'openid email profile',
            'response_type': 'code',
        }
    }
    
    if provider not in oauth_configs:
        messages.error(request, f'Invalid OAuth provider: {provider}')
        return redirect('home')
    
    config_data = oauth_configs[provider]
    
    # Build authorization URL
    auth_params = {
        'client_id': config_data['client_id'],
        'redirect_uri': config_data['redirect_uri'],
        'scope': config_data['scope'],
        'response_type': config_data['response_type'],
        'state': state,
    }
    
    # Add provider-specific parameters
    if provider == 'google':
        auth_params['access_type'] = 'offline'
        auth_params['prompt'] = 'consent'
    elif provider == 'microsoft':
        auth_params['response_mode'] = 'query'
    
    auth_url = f"{config_data['auth_url']}?" + "&".join([f"{k}={v}" for k, v in auth_params.items()])
    
    return redirect(auth_url)


def oauth_callback(request, provider):
    """
    Handle OAuth callback from provider.
    """
    code = request.GET.get('code')
    state = request.GET.get('state')
    error = request.GET.get('error')
    
    if error:
        messages.error(request, f'OAuth error: {error}')
        return redirect('home')
    
    if not code or not state:
        messages.error(request, 'Missing authorization code or state parameter')
        return redirect('home')
    
    # Validate state parameter
    stored_state = request.session.get(f'oauth_state_{provider}')
    if not validate_state(state, stored_state):
        messages.error(request, 'Invalid state parameter')
        return redirect('home')
    
    # Clear state from session
    if f'oauth_state_{provider}' in request.session:
        del request.session[f'oauth_state_{provider}']
    
    try:
        # Exchange code for tokens
        tokens = exchange_code_for_tokens(provider, code)
        
        # Get user info from provider
        user_info = get_user_info(provider, tokens['access_token'])
        
        # Create or update user
        user = create_or_update_user(provider, user_info, tokens)
        
        # Login user
        login(request, user)
        messages.success(request, f'Successfully logged in with {provider.title()}!')
        
        return redirect('profile')
        
    except Exception as e:
        logger.error(f'OAuth callback error for {provider}: {e}')
        messages.error(request, f'Authentication failed: {str(e)}')
        return redirect('home')


def exchange_code_for_tokens(provider, code):
    """
    Exchange authorization code for access tokens.
    """
    token_configs = {
        'google': {
            'url': 'https://oauth2.googleapis.com/token',
            'data': {
                'client_id': config('GOOGLE_CLIENT_ID'),
                'client_secret': config('GOOGLE_CLIENT_SECRET'),
                'redirect_uri': config('GOOGLE_REDIRECT_URI'),
                'grant_type': 'authorization_code',
                'code': code,
            }
        },
        'github': {
            'url': 'https://github.com/login/oauth/access_token',
            'data': {
                'client_id': config('GITHUB_CLIENT_ID'),
                'client_secret': config('GITHUB_CLIENT_SECRET'),
                'code': code,
            },
            'headers': {
                'Accept': 'application/json'
            }
        },
        'microsoft': {
            'url': f"https://login.microsoftonline.com/{config('MS_TENANT_ID')}/oauth2/v2.0/token",
            'data': {
                'client_id': config('MS_CLIENT_ID'),
                'client_secret': config('MS_CLIENT_SECRET'),
                'redirect_uri': config('MS_REDIRECT_URI'),
                'grant_type': 'authorization_code',
                'code': code,
            }
        }
    }
    
    config_data = token_configs[provider]
    
    response = requests.post(
        config_data['url'],
        data=config_data['data'],
        headers=config_data.get('headers', {})
    )
    
    if response.status_code != 200:
        raise Exception(f'Token exchange failed: {response.text}')
    
    return response.json()


def get_user_info(provider, access_token):
    """
    Get user information from OAuth provider.
    """
    user_info_configs = {
        'google': {
            'url': 'https://www.googleapis.com/oauth2/v2/userinfo',
            'headers': {'Authorization': f'Bearer {access_token}'}
        },
        'github': {
            'url': 'https://api.github.com/user',
            'headers': {'Authorization': f'token {access_token}'}
        },
        'microsoft': {
            'url': 'https://graph.microsoft.com/v1.0/me',
            'headers': {'Authorization': f'Bearer {access_token}'}
        }
    }
    
    config_data = user_info_configs[provider]
    
    response = requests.get(
        config_data['url'],
        headers=config_data['headers']
    )
    
    if response.status_code != 200:
        raise Exception(f'Failed to get user info: {response.text}')
    
    return response.json()


def create_or_update_user(provider, user_info, tokens):
    """
    Create or update user based on OAuth provider data.
    """
    # Extract user data based on provider
    if provider == 'google':
        email = user_info.get('email')
        username = user_info.get('name', '').replace(' ', '_').lower()
        provider_account_id = user_info.get('id')
        avatar_url = user_info.get('picture')
    elif provider == 'github':
        email = user_info.get('email')
        username = user_info.get('login')
        provider_account_id = str(user_info.get('id'))
        avatar_url = user_info.get('avatar_url')
    elif provider == 'microsoft':
        email = user_info.get('userPrincipalName')
        username = user_info.get('displayName', '').replace(' ', '_').lower()
        provider_account_id = user_info.get('id')
        avatar_url = None  # Microsoft Graph API doesn't provide avatar by default
    
    if not email:
        raise Exception('Email not provided by OAuth provider')
    
    # Create or get user
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': username or email.split('@')[0],
            'is_verified': True,
        }
    )
    
    # Create or update OAuth account
    oauth_account, created = OAuthAccount.objects.get_or_create(
        provider=provider,
        provider_account_id=provider_account_id,
        defaults={'user': user}
    )
    
    # Update OAuth account with tokens
    oauth_account.access_token = tokens.get('access_token')
    oauth_account.refresh_token = tokens.get('refresh_token')
    oauth_account.id_token = tokens.get('id_token')
    oauth_account.scope = tokens.get('scope', '')
    oauth_account.token_type = tokens.get('token_type', 'Bearer')
    
    # Calculate token expiration
    if 'expires_in' in tokens:
        from django.utils import timezone
        from datetime import timedelta
        oauth_account.expires_at = timezone.now() + timedelta(seconds=tokens['expires_in'])
    
    oauth_account.save()
    
    # Create or update user profile
    profile, created = UserProfile.objects.get_or_create(user=user)
    if avatar_url:
        profile.avatar_url = avatar_url
    profile.save()
    
    return user


@login_required
def disconnect_oauth(request, provider):
    """
    Disconnect OAuth account from user.
    """
    try:
        oauth_account = OAuthAccount.objects.get(
            user=request.user,
            provider=provider
        )
        oauth_account.delete()
        messages.success(request, f'Disconnected {provider.title()} account successfully!')
    except OAuthAccount.DoesNotExist:
        messages.error(request, f'No {provider.title()} account found to disconnect')
    
    return redirect('profile')


def logout_view(request):
    """
    Logout user and clear session.
    """
    logout(request)
    messages.info(request, 'You have been logged out successfully.')
    return redirect('home')


@csrf_exempt
@require_http_methods(["POST"])
def refresh_token_api(request):
    """
    API endpoint to refresh OAuth tokens.
    """
    try:
        data = request.json()
        provider = data.get('provider')
        
        if not provider:
            return JsonResponse({'error': 'Provider required'}, status=400)
        
        oauth_account = OAuthAccount.objects.get(
            user=request.user,
            provider=provider
        )
        
        if oauth_account.is_token_expired():
            new_tokens = refresh_oauth_token(provider, oauth_account.refresh_token)
            
            # Update tokens
            oauth_account.access_token = new_tokens.get('access_token')
            if new_tokens.get('refresh_token'):
                oauth_account.refresh_token = new_tokens.get('refresh_token')
            
            # Update expiration
            if 'expires_in' in new_tokens:
                from django.utils import timezone
                from datetime import timedelta
                oauth_account.expires_at = timezone.now() + timedelta(seconds=new_tokens['expires_in'])
            
            oauth_account.save()
            
            return JsonResponse({'success': True, 'tokens': new_tokens})
        else:
            return JsonResponse({'success': True, 'message': 'Token still valid'})
            
    except OAuthAccount.DoesNotExist:
        return JsonResponse({'error': 'OAuth account not found'}, status=404)
    except Exception as e:
        logger.error(f'Token refresh error: {e}')
        return JsonResponse({'error': str(e)}, status=500)
