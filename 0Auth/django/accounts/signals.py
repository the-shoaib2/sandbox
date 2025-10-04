"""
Django signals for user authentication and OAuth handling.
"""
import logging
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.contrib.sessions.models import Session
from .models import User, OAuthAccount, UserProfile
from .utils import revoke_oauth_token, cleanup_expired_tokens

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create user profile when a new user is created.
    """
    if created:
        UserProfile.objects.create(user=instance)
        logger.info(f'Created profile for user: {instance.email}')


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Save user profile when user is saved.
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
    else:
        # Create profile if it doesn't exist
        UserProfile.objects.create(user=instance)


@receiver(pre_delete, sender=OAuthAccount)
def revoke_oauth_tokens_on_delete(sender, instance, **kwargs):
    """
    Revoke OAuth tokens when OAuth account is deleted.
    """
    try:
        # Revoke access token
        access_token = instance.get_access_token()
        if access_token:
            revoke_oauth_token(instance.provider, access_token)
            logger.info(f'Revoked {instance.provider} tokens for user: {instance.user.email}')
    except Exception as e:
        logger.error(f'Failed to revoke tokens for {instance.provider}: {e}')


@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """
    Log user login events.
    """
    logger.info(f'User logged in: {user.email} from IP: {request.META.get("REMOTE_ADDR")}')
    
    # Clean up expired tokens on login
    try:
        cleanup_expired_tokens()
    except Exception as e:
        logger.error(f'Failed to cleanup expired tokens: {e}')


@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """
    Log user logout events and cleanup.
    """
    if user:
        logger.info(f'User logged out: {user.email}')
        
        # Optional: Revoke all OAuth tokens on logout
        # This is more aggressive but ensures complete logout
        for oauth_account in user.oauth_accounts.all():
            try:
                access_token = oauth_account.get_access_token()
                if access_token:
                    revoke_oauth_token(oauth_account.provider, access_token)
            except Exception as e:
                logger.error(f'Failed to revoke {oauth_account.provider} tokens on logout: {e}')


@receiver(post_save, sender=Session)
def cleanup_old_sessions(sender, instance, **kwargs):
    """
    Clean up old sessions to prevent database bloat.
    """
    # This signal is triggered when a session is saved
    # We can add logic here to periodically clean up old sessions
    pass


@receiver(pre_delete, sender=User)
def cleanup_user_data_on_delete(sender, instance, **kwargs):
    """
    Clean up user-related data when user is deleted.
    """
    try:
        # Revoke all OAuth tokens before deletion
        for oauth_account in instance.oauth_accounts.all():
            access_token = oauth_account.get_access_token()
            if access_token:
                revoke_oauth_token(oauth_account.provider, access_token)
        
        logger.info(f'Cleaned up OAuth tokens for deleted user: {instance.email}')
    except Exception as e:
        logger.error(f'Failed to cleanup OAuth tokens for deleted user: {e}')


@receiver(post_save, sender=OAuthAccount)
def log_oauth_account_creation(sender, instance, created, **kwargs):
    """
    Log OAuth account creation and updates.
    """
    if created:
        logger.info(f'OAuth account created: {instance.provider} for user: {instance.user.email}')
    else:
        logger.info(f'OAuth account updated: {instance.provider} for user: {instance.user.email}')


@receiver(post_save, sender=UserProfile)
def log_profile_updates(sender, instance, created, **kwargs):
    """
    Log user profile updates.
    """
    if created:
        logger.info(f'Profile created for user: {instance.user.email}')
    else:
        logger.info(f'Profile updated for user: {instance.user.email}')


# Custom signal for OAuth token refresh
from django.dispatch import Signal

oauth_token_refreshed = Signal()


@receiver(oauth_token_refreshed)
def handle_token_refresh(sender, user, provider, **kwargs):
    """
    Handle OAuth token refresh events.
    """
    logger.info(f'OAuth token refreshed: {provider} for user: {user.email}')
    
    # You can add additional logic here, such as:
    # - Notifying the user via email
    # - Updating related services
    # - Logging for analytics


# Custom signal for OAuth account connection
oauth_account_connected = Signal()


@receiver(oauth_account_connected)
def handle_account_connection(sender, user, provider, **kwargs):
    """
    Handle OAuth account connection events.
    """
    logger.info(f'OAuth account connected: {provider} for user: {user.email}')
    
    # You can add additional logic here, such as:
    # - Sending welcome email
    # - Syncing user data from provider
    # - Updating user preferences


# Custom signal for OAuth account disconnection
oauth_account_disconnected = Signal()


@receiver(oauth_account_disconnected)
def handle_account_disconnection(sender, user, provider, **kwargs):
    """
    Handle OAuth account disconnection events.
    """
    logger.info(f'OAuth account disconnected: {provider} for user: {user.email}')
    
    # You can add additional logic here, such as:
    # - Sending confirmation email
    # - Clearing provider-specific data
    # - Updating user preferences
