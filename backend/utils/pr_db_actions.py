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


async def trigger_workflow(repo_name, owner, action_workflow_filename, base_branch, head_branch, GITHUB_TOKEN):

    # Trigger GitHub Action workflow_dispatch
    url = f"https://api.github.com/repos/{owner}/{repo_name}/actions/workflows/{action_workflow_filename}/dispatches"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json"
    }
    json_data = {
        "ref":base_branch,  # run action on base branch (e.g., main)
        "inputs": {
            "head_ref": head_branch,
            "base_ref": base_branch
        }
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=json_data)
        if resp.status_code != 204:
            raise Exception(f"Failed to trigger workflow: {resp.text}")

async def verify_repo_access(token, owner, repo_name):
    url = f"https://api.github.com/repos/{owner}/{repo_name}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code != 200:
            raise Exception(f"No access to repository: {resp.text}")

async def check_workflow_exists(token, owner, repo_name, workflow_filename):
    url = f"https://api.github.com/repos/{owner}/{repo_name}/actions/workflows"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        workflows = resp.json()['workflows']
        print(workflows)
        return any(w["name"] == workflow_filename or 
                  w["path"].endswith(workflow_filename) 
                  for w in workflows)


async def get_installation_details(jwt_token, installation_id):
    url = f"https://api.github.com/app/installations/{installation_id}"
    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Accept": "application/vnd.github+json"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code != 200:
            raise Exception(f"Failed to get installation: {response.text}")
        return response.json()


@celery_app.task
def handle_new_pr(data):
    try:
        mergeable = asyncio.run(check_pr_mergeable(data))
        if not mergeable:
            installation_token = asyncio.run(get_or_refresh_installation_token(data["installation"]["id"]))
            asyncio.run(trigger_workflow(data['repository']["name"], data['repository']["owner"]['login'], "merge-conflict.yaml", data["pull_request"]["base"]["ref"], data["pull_request"]["head"]["ref"], installation_token))
    except Exception as e:
        print(f"Error handling new PR: {e}")
        raise Exception("Error processing PR data")
    