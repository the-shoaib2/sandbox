# Database Schema

## Users Table

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(128) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
```

## OAuth Accounts Table

```sql
CREATE TABLE oauth_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'github', 'microsoft')),
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);
CREATE INDEX idx_oauth_accounts_expires_at ON oauth_accounts(expires_at);
```

## User Profiles Table

```sql
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(100),
    website TEXT,
    github_username VARCHAR(100),
    twitter_username VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

## Django Auth Tables (Standard)

```sql
-- Groups table
CREATE TABLE auth_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

-- User groups many-to-many
CREATE TABLE auth_group_permissions (
    id BIGSERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
    UNIQUE(group_id, permission_id)
);

-- Permissions table
CREATE TABLE auth_permission (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content_type_id INTEGER NOT NULL REFERENCES django_content_type(id) ON DELETE CASCADE,
    codename VARCHAR(100) NOT NULL,
    UNIQUE(content_type_id, codename)
);

-- User permissions many-to-many
CREATE TABLE auth_user_user_permissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
    UNIQUE(user_id, permission_id)
);

-- Sessions table
CREATE TABLE django_session (
    session_key VARCHAR(40) PRIMARY KEY,
    session_data TEXT NOT NULL,
    expire_date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_django_session_expire_date ON django_session(expire_date);
```

## Security Considerations

1. **Token Encryption**: All OAuth tokens (access_token, refresh_token, id_token) are encrypted at rest using Fernet encryption.

2. **Indexes**: Proper indexes are created for performance optimization.

3. **Foreign Key Constraints**: CASCADE deletes ensure data consistency.

4. **Unique Constraints**: Prevent duplicate OAuth accounts for the same provider.

5. **Check Constraints**: Ensure provider values are valid.

## Sample Queries

```sql
-- Find user by email
SELECT * FROM users WHERE email = 'user@example.com';

-- Get all OAuth accounts for a user
SELECT u.email, oa.provider, oa.provider_account_id, oa.expires_at
FROM users u
JOIN oauth_accounts oa ON u.id = oa.user_id
WHERE u.email = 'user@example.com';

-- Find expired tokens
SELECT u.email, oa.provider, oa.expires_at
FROM users u
JOIN oauth_accounts oa ON u.id = oa.user_id
WHERE oa.expires_at < NOW();

-- Get user profile with OAuth info
SELECT u.email, up.avatar_url, up.bio, oa.provider
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN oauth_accounts oa ON u.id = oa.user_id
WHERE u.email = 'user@example.com';
```
