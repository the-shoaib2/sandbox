/**
 * Main JavaScript for OAuth Authentication
 */

// Global variables
let isLoading = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupAnimations();
});

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('OAuth Authentication App Initialized');
    
    // Add loading states to OAuth buttons
    setupOAuthButtons();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        setupTooltips();
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // OAuth button click handlers
    const oauthButtons = document.querySelectorAll('a[href*="oauth"]');
    oauthButtons.forEach(button => {
        button.addEventListener('click', handleOAuthClick);
    });
    
    // Form submission handlers
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
    
    // Logout confirmation
    const logoutLinks = document.querySelectorAll('a[href*="logout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', handleLogoutClick);
    });
    
    // Auto-dismiss alerts
    setupAlertAutoDismiss();
}

/**
 * Setup OAuth buttons with loading states
 */
function setupOAuthButtons() {
    const oauthButtons = document.querySelectorAll('a[href*="oauth"]');
    
    oauthButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (isLoading) {
                e.preventDefault();
                return false;
            }
            
            const originalText = this.innerHTML;
            const provider = extractProviderFromUrl(this.href);
            
            // Show loading state
            this.innerHTML = `
                <i class="fas fa-spinner fa-spin me-2"></i>
                Connecting to ${provider}...
            `;
            this.classList.add('btn-loading');
            this.style.pointerEvents = 'none';
            
            isLoading = true;
            
            // Reset after timeout
            setTimeout(() => {
                this.innerHTML = originalText;
                this.classList.remove('btn-loading');
                this.style.pointerEvents = 'auto';
                isLoading = false;
            }, 10000);
        });
    });
}

/**
 * Extract provider name from OAuth URL
 */
function extractProviderFromUrl(url) {
    const match = url.match(/oauth\/([^\/]+)\//);
    return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : 'OAuth Provider';
}

/**
 * Handle OAuth button clicks
 */
function handleOAuthClick(e) {
    const button = e.currentTarget;
    const provider = extractProviderFromUrl(button.href);
    
    // Analytics tracking (if available)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'oauth_click', {
            'provider': provider.toLowerCase(),
            'event_category': 'authentication'
        });
    }
    
    // Show loading state
    showButtonLoading(button, `Connecting to ${provider}...`);
}

/**
 * Show loading state on button
 */
function showButtonLoading(button, text) {
    const originalText = button.innerHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${text}`;
    button.classList.add('btn-loading');
    button.style.pointerEvents = 'none';
    
    // Store original text for restoration
    button.dataset.originalText = originalText;
}

/**
 * Hide loading state on button
 */
function hideButtonLoading(button) {
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
    }
    button.classList.remove('btn-loading');
    button.style.pointerEvents = 'auto';
}

/**
 * Handle form submissions
 */
function handleFormSubmit(e) {
    const form = e.currentTarget;
    
    // Validate form
    if (!validateForm(form)) {
        e.preventDefault();
        return false;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        showButtonLoading(submitButton, 'Saving...');
    }
}

/**
 * Validate form fields
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    
    // Remove existing validation classes
    field.classList.remove('is-valid', 'is-invalid');
    
    // Skip validation for hidden fields
    if (field.type === 'hidden') {
        return true;
    }
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            field.classList.add('is-invalid');
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // URL validation
    if (fieldName === 'website' && value) {
        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(value)) {
            field.classList.add('is-invalid');
            showFieldError(field, 'Please enter a valid URL starting with http:// or https://');
            return false;
        }
    }
    
    // GitHub username validation
    if (fieldName === 'github_username' && value) {
        const githubPattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
        if (!githubPattern.test(value)) {
            field.classList.add('is-invalid');
            showFieldError(field, 'GitHub username can only contain letters, numbers, and hyphens');
            return false;
        }
    }
    
    // Twitter username validation
    if (fieldName === 'twitter_username' && value) {
        const twitterPattern = /^[a-zA-Z0-9_]{1,15}$/;
        if (!twitterPattern.test(value)) {
            field.classList.add('is-invalid');
            showFieldError(field, 'Twitter username can only contain letters, numbers, and underscores (max 15 characters)');
            return false;
        }
    }
    
    // Password validation
    if (fieldType === 'password' && value) {
        if (value.length < 8) {
            field.classList.add('is-invalid');
            showFieldError(field, 'Password must be at least 8 characters long');
            return false;
        }
    }
    
    field.classList.add('is-valid');
    hideFieldError(field);
    return true;
}

/**
 * Show field error message
 */
function showFieldError(field, message) {
    hideFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    errorDiv.id = `${field.name}_error`;
    
    field.parentNode.appendChild(errorDiv);
}

/**
 * Hide field error message
 */
function hideFieldError(field) {
    const existingError = document.getElementById(`${field.name}_error`);
    if (existingError) {
        existingError.remove();
    }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            // Clear validation on focus
            input.addEventListener('focus', function() {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            });
        });
    });
}

/**
 * Handle logout clicks
 */
function handleLogoutClick(e) {
    if (!confirm('Are you sure you want to logout?')) {
        e.preventDefault();
        return false;
    }
}

/**
 * Setup alert auto-dismiss
 */
function setupAlertAutoDismiss() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(alert => {
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.remove();
                    }
                }, 500);
            }
        }, 5000);
    });
}

/**
 * Setup tooltips
 */
function setupTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Setup animations
 */
function setupAnimations() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

/**
 * Refresh OAuth token
 */
function refreshToken(provider) {
    if (!confirm(`Refresh token for ${provider}?`)) {
        return;
    }
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (!csrfToken) {
        alert('CSRF token not found');
        return;
    }
    
    fetch('/accounts/api/refresh-token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken.value
        },
        body: JSON.stringify({
            provider: provider
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Failed to refresh token: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to refresh token');
    });
}

/**
 * Disconnect OAuth account
 */
function disconnectOAuth(provider) {
    if (!confirm(`Are you sure you want to disconnect your ${provider} account?`)) {
        return;
    }
    
    window.location.href = `/accounts/oauth/${provider}/disconnect/`;
}

/**
 * Utility function to show notifications
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the main content
    const main = document.querySelector('main');
    if (main) {
        main.insertBefore(notification, main.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

/**
 * Utility function to format dates
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Utility function to copy text to clipboard
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!', 'success');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Copied to clipboard!', 'success');
    }
}

// Export functions for global use
window.OAuthApp = {
    refreshToken,
    disconnectOAuth,
    showNotification,
    formatDate,
    copyToClipboard
};
