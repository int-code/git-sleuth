from utils.repository_db_actions import handle_add_repositories, handle_remove_repositories
from utils.pr_db_actions import handle_new_pr

def route_event(event_type, payload):
    if event_type == "installation_repositories":
        if payload.get("action") == "added":
            repos = payload.get("repositories_added", [])
            installation_id = payload.get("installation", {}).get("id")
            if len(repos)>0 or not installation_id is None:
                handle_add_repositories.delay(repos, installation_id)
            else:
                raise ValueError("No repositories added in the payload")
        elif payload.get("action") == "removed":
            repos = payload.get("repositories_removed", [])
            installation_id = payload.get("installation", {}).get("id")
            if len(repos)>0 or not installation_id is None:
                handle_remove_repositories.delay(repos)
            else:
                raise ValueError("No repositories added in the payload")
    elif event_type == "installation":
        if payload.get("action") == "created":
            repos = payload.get("repositories", [])
            installation_id = payload.get("installation", {}).get("id")
            if len(repos)>0 and not installation_id is None:
                handle_add_repositories.delay(repos, installation_id)
            else:
                raise ValueError("No repositories added in the payload")
        elif payload.get("action") == "deleted":
            repos = payload.get("repositories", [])
            installation_id = payload.get("installation", {}).get("id")
            if len(repos)>0 or not installation_id is None:
                handle_remove_repositories.delay(repos)
            else:
                raise ValueError("No repositories added in the payload")
    elif event_type == "pull_request":
        handle_new_pr.delay(payload)
