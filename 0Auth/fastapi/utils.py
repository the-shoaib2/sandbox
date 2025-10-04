from cryptography.fernet import Fernet
from decouple import config
import base64

def get_encryption_key():
    """Get or create encryption key for tokens"""
    key = config('ENCRYPTION_KEY', default=None)
    if not key:
        # Generate a new key if not set
        key = Fernet.generate_key()
        print(f"WARNING: Generated new encryption key. Set ENCRYPTION_KEY={key.decode()} in environment")
    else:
        if isinstance(key, str):
            key = key.encode()
    return key

def encrypt_token(token: str) -> str:
    """Encrypt OAuth token for storage"""
    if not token:
        return token
    
    key = get_encryption_key()
    f = Fernet(key)
    encrypted_token = f.encrypt(token.encode())
    return base64.b64encode(encrypted_token).decode()

def decrypt_token(encrypted_token: str) -> str:
    """Decrypt OAuth token from storage"""
    if not encrypted_token:
        return encrypted_token
    
    try:
        key = get_encryption_key()
        f = Fernet(key)
        encrypted_data = base64.b64decode(encrypted_token.encode())
        decrypted_token = f.decrypt(encrypted_data)
        return decrypted_token.decode()
    except Exception:
        return None
