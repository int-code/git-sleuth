from datetime import datetime, timezone
from fastapi import APIRouter, Request, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse, HTMLResponse
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
import os
from jose import ExpiredSignatureError, JWTError, jwt
import httpx
import time
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv
from redis_setup import redis



load_dotenv()
auth_router = APIRouter()
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


@auth_router.get("/login")
async def login(request: Request):
    return await oauth.github.authorize_redirect(
        request, 
        request.url_for("auth")
    )

@auth_router.get("/auth")
async def auth(request: Request):
    try:
        token = await oauth.github.authorize_access_token(request)
        user = await oauth.github.get('https://api.github.com/user', token=token)
        request.session["user"] = user.json()
        return RedirectResponse(url="/")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@auth_router.get("/install-app")
async def install_app(request: Request):
    """Initiate GitHub App installation flow"""
    if "user" not in request.session:
        return RedirectResponse(url="/login")
    
    print("User session:", request.session["user"])
    
    # Generate state to prevent CSRF
    state = jwt.encode(
        {"user_id": request.session["user"]["id"], "exp": time.time() + 300},
        get_private_key(),
        algorithm="RS256"
    )
    
    # GitHub App installation URL
    installation_url = (
        f"https://github.com/apps/{os.getenv('GITHUB_APP_NAME')}/installations/new"
        f"?state={state}"
    )
    
    return RedirectResponse(url=installation_url)


@auth_router.get("/installation-callback")
async def installation_callback(
    request: Request,
    installation_id: str = Query(...),
    setup_action: str = Query(None),
    state: str = Query(...)
):
    """Handle installation callback from GitHub"""
    try:
        print(request, installation_id, setup_action, state)
        # Verify state
        decoded_state = jwt.decode(
            state,
            get_private_key(),
            algorithms=["RS256"]
        )
        
        # Verify user session matches state
        if "user" not in request.session or str(request.session["user"]["id"]) != str(decoded_state["user_id"]):
            raise HTTPException(status_code=403, detail="Invalid user session")
        
        # Get installation token
        await get_or_refresh_installation_token()
        
        # Store the installation_id and token in your database
        # Link to user_id from session: request.session["user"]["id"]
        # Example: await store_installation(decoded_state["user_id"], installation_id, installation_token)
        
        return {"status": "success", "installation_id": installation_id}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Expired state token")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid state token")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="GitHub API error")

async def generate_new_installation_token(installation_id: str):
    async with httpx.AsyncClient() as client:
        # Create JWT for app authentication
        app_jwt = jwt.encode(
            {
                "iat": int(time.time()),
                "exp": int(time.time()) + 600,
                "iss": GITHUB_APP_ID,
                "algorithm": "RS256"
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
        json_response = token_response.json()
        installation_token = json_response["token"]
        expires_at = json_response["expires_at"]
        return installation_token, expires_at

async def get_or_refresh_installation_token(installation_id: str):
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