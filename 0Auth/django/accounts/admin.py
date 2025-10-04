"""
Django admin configuration for accounts app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import User, OAuthAccount, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User admin with OAuth account integration.
    """
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_active', 'is_verified', 'date_joined', 'oauth_providers')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
    
    def oauth_providers(self, obj):
        """
        Display connected OAuth providers.
        """
        providers = obj.oauth_accounts.values_list('provider', flat=True)
        if providers:
            badges = []
            for provider in providers:
                color = {
                    'google': '#4285f4',
                    'github': '#333333',
                    'microsoft': '#0078d4'
                }.get(provider, '#6c757d')
                badges.append(
                    f'<span style="background-color: {color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">{provider.title()}</span>'
                )
            return mark_safe(' '.join(badges))
        return '-'
    
    oauth_providers.short_description = 'OAuth Providers'


@admin.register(OAuthAccount)
class OAuthAccountAdmin(admin.ModelAdmin):
    """
    OAuth Account admin.
    """
    list_display = ('user', 'provider', 'provider_account_id', 'created_at', 'expires_at', 'is_token_expired')
    list_filter = ('provider', 'created_at', 'expires_at')
    search_fields = ('user__email', 'provider_account_id')
    readonly_fields = ('access_token', 'refresh_token', 'id_token', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'provider', 'provider_account_id')
        }),
        ('Tokens', {
            'fields': ('access_token', 'refresh_token', 'id_token', 'token_type', 'scope'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('expires_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_token_expired(self, obj):
        """
        Display if token is expired.
        """
        if obj.is_token_expired():
            return format_html('<span style="color: red;">Expired</span>')
        elif obj.expires_at:
            return format_html('<span style="color: green;">Valid</span>')
        return '-'
    
    is_token_expired.short_description = 'Token Status'
    
    def get_queryset(self, request):
        """
        Optimize queryset with select_related.
        """
        return super().get_queryset(request).select_related('user')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    User Profile admin.
    """
    list_display = ('user', 'location', 'website', 'github_username', 'twitter_username', 'created_at')
    list_filter = ('created_at', 'location')
    search_fields = ('user__email', 'user__username', 'location', 'github_username', 'twitter_username')
    readonly_fields = ('created_at', 'updated_at', 'avatar_preview')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'bio')
        }),
        ('Contact & Social', {
            'fields': ('location', 'website', 'github_username', 'twitter_username')
        }),
        ('Avatar', {
            'fields': ('avatar_url', 'avatar_preview')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def avatar_preview(self, obj):
        """
        Display avatar preview.
        """
        if obj.avatar_url:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px; border-radius: 50%;" />',
                obj.avatar_url
            )
        return 'No avatar'
    
    avatar_preview.short_description = 'Avatar Preview'
    
    def get_queryset(self, request):
        """
        Optimize queryset with select_related.
        """
        return super().get_queryset(request).select_related('user')


# Customize admin site
admin.site.site_header = 'OAuth Authentication Admin'
admin.site.site_title = 'OAuth Admin'
admin.site.index_title = 'Welcome to OAuth Authentication Admin'
