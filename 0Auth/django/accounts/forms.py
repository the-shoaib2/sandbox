"""
Forms for user authentication and profile management.
"""
from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, UserProfile


class CustomUserCreationForm(UserCreationForm):
    """
    Custom user creation form with email as username.
    """
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        if commit:
            user.save()
        return user


class UserProfileForm(forms.ModelForm):
    """
    Form for updating user profile information.
    """
    class Meta:
        model = UserProfile
        fields = ['bio', 'location', 'website', 'github_username', 'twitter_username']
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4, 'cols': 40, 'placeholder': 'Tell us about yourself...'}),
            'location': forms.TextInput(attrs={'placeholder': 'City, Country'}),
            'website': forms.URLInput(attrs={'placeholder': 'https://your-website.com'}),
            'github_username': forms.TextInput(attrs={'placeholder': 'your-github-username'}),
            'twitter_username': forms.TextInput(attrs={'placeholder': '@your-twitter-handle'}),
        }
    
    def clean_github_username(self):
        """
        Clean and validate GitHub username.
        """
        username = self.cleaned_data.get('github_username')
        if username:
            # Remove @ if present
            username = username.lstrip('@')
            # GitHub usernames can only contain alphanumeric characters and hyphens
            if not username.replace('-', '').replace('_', '').isalnum():
                raise forms.ValidationError('GitHub username can only contain letters, numbers, hyphens, and underscores.')
        return username
    
    def clean_twitter_username(self):
        """
        Clean and validate Twitter username.
        """
        username = self.cleaned_data.get('twitter_username')
        if username:
            # Remove @ if present
            username = username.lstrip('@')
            # Twitter usernames can only contain alphanumeric characters and underscores
            if not username.replace('_', '').isalnum():
                raise forms.ValidationError('Twitter username can only contain letters, numbers, and underscores.')
        return username


class UserUpdateForm(forms.ModelForm):
    """
    Form for updating user basic information.
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']
        widgets = {
            'first_name': forms.TextInput(attrs={'placeholder': 'First Name'}),
            'last_name': forms.TextInput(attrs={'placeholder': 'Last Name'}),
            'email': forms.EmailInput(attrs={'placeholder': 'your@email.com'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make email field read-only if user has OAuth accounts
        if self.instance and self.instance.oauth_accounts.exists():
            self.fields['email'].widget.attrs['readonly'] = True
            self.fields['email'].help_text = 'Email cannot be changed for OAuth users'


class PasswordChangeForm(forms.Form):
    """
    Form for changing user password (for non-OAuth users).
    """
    current_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Current Password'}),
        label='Current Password'
    )
    new_password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'New Password'}),
        label='New Password'
    )
    new_password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Confirm New Password'}),
        label='Confirm New Password'
    )
    
    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)
    
    def clean_current_password(self):
        """
        Validate current password.
        """
        current_password = self.cleaned_data.get('current_password')
        if not self.user.check_password(current_password):
            raise forms.ValidationError('Current password is incorrect.')
        return current_password
    
    def clean(self):
        """
        Validate that both password fields match.
        """
        cleaned_data = super().clean()
        new_password1 = cleaned_data.get('new_password1')
        new_password2 = cleaned_data.get('new_password2')
        
        if new_password1 and new_password2:
            if new_password1 != new_password2:
                raise forms.ValidationError('New passwords do not match.')
        
        return cleaned_data
    
    def save(self):
        """
        Save the new password.
        """
        new_password = self.cleaned_data['new_password1']
        self.user.set_password(new_password)
        self.user.save()
        return self.user


class OAuthConnectForm(forms.Form):
    """
    Form for connecting additional OAuth accounts.
    """
    provider = forms.ChoiceField(
        choices=[
            ('google', 'Google'),
            ('github', 'GitHub'),
            ('microsoft', 'Microsoft'),
        ],
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    
    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)
        
        # Remove already connected providers from choices
        connected_providers = set(
            self.user.oauth_accounts.values_list('provider', flat=True)
        )
        available_choices = [
            choice for choice in self.fields['provider'].choices
            if choice[0] not in connected_providers
        ]
        self.fields['provider'].choices = available_choices
        
        if not available_choices:
            self.fields['provider'].widget.attrs['disabled'] = True
            self.fields['provider'].help_text = 'All available providers are already connected.'
