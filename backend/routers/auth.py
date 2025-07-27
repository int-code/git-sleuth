from fastapi import APIRouter, Request, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
import os
from jose import jwt
import httpx
import time
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv
from redis_setup import get_redis

from utils.auth_helper import get_private_key, get_or_refresh_installation_token, oauth, GITHUB_PRIVATE_KEY_PATH


auth_router = APIRouter()

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
        await get_or_refresh_installation_token(installation_id)
        
        
        return {"status": "success", "installation_id": installation_id}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Expired state token")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid state token")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e)
