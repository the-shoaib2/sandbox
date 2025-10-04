"""
URL configuration for accounts app.
"""
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication URLs
    path('', views.HomeView.as_view(), name='home'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('logout/', views.logout_view, name='logout'),
    
    # OAuth URLs
    path('oauth/<str:provider>/login/', views.oauth_login, name='oauth_login'),
    path('oauth/<str:provider>/callback/', views.oauth_callback, name='oauth_callback'),
    path('oauth/<str:provider>/disconnect/', views.disconnect_oauth, name='disconnect_oauth'),
    
    # API URLs
    path('api/refresh-token/', views.refresh_token_api, name='refresh_token_api'),
]
