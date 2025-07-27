from datetime import datetime, timezone
import os
from pathlib import Path
import time
from authlib.integrations.starlette_client import OAuth
import httpx
from jose import jwt
from redis_setup import get_redis
from dotenv import load_dotenv

load_dotenv()
# OAuth setup
oauth = OAuth()
oauth.register(
    name='github',
    client_id=os.getenv("GITHUB_APP_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_APP_CLIENT_SECRET"),
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    client_kwargs={'scope': 'user:email'},
)

# GitHub App credentials
GITHUB_APP_ID = os.getenv("GITHUB_APP_ID")
GITHUB_APP_CLIENT_ID = os.getenv("GITHUB_APP_CLIENT_ID")
GITHUB_PRIVATE_KEY_PATH = os.getenv("GITHUB_PRIVATE_KEY_PATH")

def get_private_key():
    """Read and return the private key with proper error handling"""
    if not GITHUB_PRIVATE_KEY_PATH:
        raise ValueError("GITHUB_PRIVATE_KEY_PATH environment variable not set")
    
    key_path = Path(GITHUB_PRIVATE_KEY_PATH)
    
    if not key_path.exists():
        raise FileNotFoundError(f"Private key file not found at {key_path}")
    
    with open(key_path, 'r') as key_file:
        private_key = key_file.read()
    
    if not private_key:
        raise ValueError("Private key file is empty")
    
    return private_key



async def generate_new_installation_token(installation_id: str):
    async with httpx.AsyncClient() as client:
        # Create JWT for app authentication
        app_jwt = jwt.encode(
            {
                "iat": int(time.time()),
                "exp": int(time.time()) + 600,
                "iss": GITHUB_APP_ID
            },
            get_private_key(),
            algorithm="RS256"
        )
        # Get installation token
        headers = {
            "Authorization": f"Bearer {app_jwt}",
            "Accept": "application/vnd.github.v3+json"
        }
        token_response = await client.post(
            f"https://api.github.com/app/installations/{installation_id}/access_tokens",
            headers=headers
        )
        token_response.raise_for_status()
        print(token_response.text)
        json_response = token_response.json()
        installation_token = json_response["token"]
        expires_at = json_response["expires_at"]
        return installation_token, expires_at

async def get_or_refresh_installation_token(installation_id: str):
    redis = get_redis()
    installation_token= await redis.get(f"installation_id:{installation_id}")
    expires_at = await redis.get(f"installation_id:{installation_id}_expires_at")

    if installation_token and expires_at:
        expiry_time = datetime.strptime(expires_at, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
        current_time = datetime.now(timezone.utc)
        if expiry_time > current_time:
            return installation_token

    # Re-generate token here
    new_token, expires_at = await generate_new_installation_token(installation_id)
    await redis.set(f"installation_id:{installation_id}", new_token, ex=3600)
    await redis.set(f"installation_id:{installation_id}_expires_at", expires_at, ex=3600)
    return new_token