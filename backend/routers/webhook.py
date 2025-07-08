import os
from fastapi import APIRouter, HTTPException, Request, Depends
import hmac
import hashlib

from utils.event_routing import route_event
from db import get_db

WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET")

webhook_router = APIRouter()

def verify_signature(payload_body, signature_header):
    if not signature_header:
        return False
    
    hash_object = hmac.new(
        WEBHOOK_SECRET.encode(),
        msg=payload_body,
        digestmod=hashlib.sha256
    )
    expected_signature = "sha256=" + hash_object.hexdigest()
    return hmac.compare_digest(expected_signature, signature_header)

@webhook_router.post("/webhook")
async def handle_webhook(request: Request):
    signature = request.headers.get("X-Hub-Signature-256", "")
    body = await request.body()
    
    if not verify_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    event_type = request.headers.get("X-GitHub-Event")
    payload = await request.json()
    
    try:
        route_event(event_type, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing event: {str(e)}")
    return {"status": "success", "message": f"Processed {event_type} event"}
    