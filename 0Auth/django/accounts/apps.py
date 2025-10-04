"""
Django app configuration for accounts.
"""
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """
    Configuration for the accounts app.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    verbose_name = 'User Accounts'
    
    def ready(self):
        """
        Import signals when the app is ready.
        """
        import accounts.signals
