from fastapi import Request, HTTPException
from typing import Optional
import httpx
import asyncio
import json

from db import get_db
from config import celery_app
from routers.auth import get_or_refresh_installation_token
from models.merge_conflicts import MergeConflict
from models.pr import PullRequests
from models.repo import Repository

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


async def trigger_workflow(repo_name, owner, action_workflow_filename, base_branch, head_branch, GITHUB_TOKEN, merge_id):

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
            "base_ref": base_branch,
            "merge_id": merge_id
        }
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=json_data)
        if resp.status_code != 204:
            raise Exception(f"Failed to trigger workflow: {resp.text}")

@celery_app.task
def handle_new_pr(data):
    try:
        db = next(get_db())
        pr = db.query(PullRequests).filter(PullRequests.github_id == data['pull_request']['id']).first()
        if not pr:
            repo = db.query(Repository).filter(Repository.github_id == data['repository']['id']).first()
            if not repo:
                raise Exception("App is not installed on repository")
            pr = PullRequests(repo_id=repo.id, 
                              pr_number=data["pull_request"]['number'],
                              installation_id=data['installation']['id'],
                              url=data['pull_request']['url'],
                              github_id=data['pull_request']['id'],
                              node_id=data['pull_request']['node_id'],
                              state=data['pull_request']['state'],
                              title=data['pull_request']['title'],
                              commits=data['pull_request']['commits'],
                              details=json.dumps(data))
            db.add(pr)
            db.commit()
            db.refresh(pr)
        mergeable = asyncio.run(check_pr_mergeable(data))
        if not mergeable:
            new_merge_conflict = MergeConflict(pr_id=pr.id, status="open")
            db.add(new_merge_conflict)
            db.commit()
            db.refresh(new_merge_conflict)
            installation_token = asyncio.run(get_or_refresh_installation_token(data["installation"]["id"]))
            asyncio.run(trigger_workflow(data['repository']["name"], data['repository']["owner"]['login'], "merge-conflict.yaml", data["pull_request"]["base"]["ref"], data["pull_request"]["head"]["ref"], installation_token, new_merge_conflict.id))
    except Exception as e:
        print(f"Error handling new PR: {e}")
        raise Exception("Error processing PR data")
    