"""
User and OAuth account models.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from cryptography.fernet import Fernet
from decouple import config
import base64
import logging

logger = logging.getLogger(__name__)


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    """
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.email


class OAuthAccount(models.Model):
    """
    Model to store OAuth provider accounts linked to users.
    """
    OAUTH_PROVIDERS = [
        ('google', 'Google'),
        ('github', 'GitHub'),
        ('microsoft', 'Microsoft'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='oauth_accounts',
        db_column='user_id'
    )
    provider = models.CharField(max_length=20, choices=OAUTH_PROVIDERS)
    provider_account_id = models.CharField(max_length=255)
    access_token = models.TextField(blank=True)
    refresh_token = models.TextField(blank=True)
    id_token = models.TextField(blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    token_type = models.CharField(max_length=50, default='Bearer')
    scope = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'oauth_accounts'
        unique_together = ['provider', 'provider_account_id']
        verbose_name = 'OAuth Account'
        verbose_name_plural = 'OAuth Accounts'
    
    def __str__(self):
        return f"{self.user.email} - {self.provider}"
    
    def save(self, *args, **kwargs):
        """
        Encrypt sensitive tokens before saving.
        """
        if self.access_token:
            self.access_token = self._encrypt_token(self.access_token)
        if self.refresh_token:
            self.refresh_token = self._encrypt_token(self.refresh_token)
        if self.id_token:
            self.id_token = self._encrypt_token(self.id_token)
        super().save(*args, **kwargs)
    
    def get_access_token(self):
        """
        Decrypt and return access token.
        """
        return self._decrypt_token(self.access_token)
    
    def get_refresh_token(self):
        """
        Decrypt and return refresh token.
        """
        return self._decrypt_token(self.refresh_token)
    
    def get_id_token(self):
        """
        Decrypt and return ID token.
        """
        return self._decrypt_token(self.id_token)
    
    def is_token_expired(self):
        """
        Check if the access token is expired.
        """
        if not self.expires_at:
            return False
        return timezone.now() >= self.expires_at
    
    def _get_encryption_key(self):
        """
        Get or create encryption key for tokens.
        """
        key = config('ENCRYPTION_KEY', default=None)
        if not key:
            # Generate a new key if not set
            key = Fernet.generate_key()
            logger.warning(f"Generated new encryption key. Set ENCRYPTION_KEY={key.decode()} in environment")
        else:
            if isinstance(key, str):
                key = key.encode()
        return key
    
    def _encrypt_token(self, token):
        """
        Encrypt OAuth token for storage.
        """
        if not token:
            return token
        
        try:
            key = self._get_encryption_key()
            f = Fernet(key)
            encrypted_token = f.encrypt(token.encode())
            return base64.b64encode(encrypted_token).decode()
        except Exception as e:
            logger.error(f"Failed to encrypt token: {e}")
            return token
    
    def _decrypt_token(self, encrypted_token):
        """
        Decrypt OAuth token from storage.
        """
        if not encrypted_token:
            return encrypted_token
        
        try:
            key = self._get_encryption_key()
            f = Fernet(key)
            encrypted_data = base64.b64decode(encrypted_token.encode())
            decrypted_token = f.decrypt(encrypted_data)
            return decrypted_token.decode()
        except Exception as e:
            logger.error(f"Failed to decrypt token: {e}")
            return None


class UserProfile(models.Model):
    """
    Extended user profile information.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    github_username = models.CharField(max_length=100, blank=True)
    twitter_username = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.email} Profile"
