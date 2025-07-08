from fastapi import Request, HTTPException
from typing import Optional
import httpx
import asyncio

from config import celery_app
from routers.auth import get_or_refresh_installation_token

async def fetch_pr_details(owner: str, repo: str, pr_number: int, installation_id: int) -> dict:
    """Poll GitHub API for PR details until mergeable is not null"""
    print("installation_id", installation_id)
    print(f"Fetching PR details for {owner}/{repo}#{pr_number}")
    GITHUB_ACCESS_TOKEN = await get_or_refresh_installation_token(installation_id)
    print(f"access token {GITHUB_ACCESS_TOKEN}")
    HEADERS = {
        "Authorization": f"Bearer {GITHUB_ACCESS_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    async with httpx.AsyncClient() as client:
        for _ in range(5):  # Retry up to 5 times
            response = await client.get(url, headers=HEADERS)
            if response.status_code != 200:
                raise Exception("GitHub API error")
            
            pr_data = response.json()
            if pr_data["mergeable"] is not None:  # Mergeability calculated
                return pr_data
            
            await asyncio.sleep(3)  # Wait 3 seconds before retrying
        
        raise Exception("Mergeability check timeout")
    

async def check_pr_mergeable(data):

    if data.get("mergeable") is None:
        try:
            # Fetch updated PR details with mergeable status
            updated_pr = await fetch_pr_details(
                owner=data["repository"]["owner"]["login"],
                repo=data["repository"]["name"],
                pr_number=data["number"],
                installation_id=data["installation"]["id"]
            )
            
            return updated_pr["mergeable"]
                
        except Exception as e:
            print(f"Error checking mergeability: {e}")
            raise e


@celery_app.task
def handle_new_pr(data):
    try:
        mergeable = asyncio.run(check_pr_mergeable(data))
        if not mergeable:
            resolve_merge_conflicts.delay(data)
    except Exception as e:
        print(f"Error handling new PR: {e}")
        raise Exception("Error processing PR data")
    

@celery_app.task
def resolve_merge_conflicts(data):
    pass