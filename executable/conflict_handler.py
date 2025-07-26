import subprocess
import json
import time
import requests
import sys
from utils import get_conflicted_files, extract_semantic_conflict_blocks, try_simple_resolve
from uuid import uuid4

API_URL = "http://localhost:8000"
def conflict_handler():
    conflicted_files = get_conflicted_files()
    if len(conflicted_files) == 0:
        print("No merge conflicts found.")
        return

    for file_path in conflicted_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            file_content = f.read()
        conflict_blocks = extract_semantic_conflict_blocks(file_content)
        not_resolved = []
        file = file_content
        for chunk in conflict_blocks:
            resolution = try_simple_resolve(file, chunk)
            if resolution:
                file = resolution
            else:
                not_resolved.append(chunk)
            
        if len(not_resolved) > 0:
            task_id = str(uuid4())
            response = requests.post(API_URL+"/resolve_conflicts", json={
                "file": file,
                "file_path": file_path,
                "task_id": task_id
            })
            if response.status_code != 200:
                print(f"Error submitting task: {response.text}")
                sys.exit(1)
            
            result = None
            # poll for result from backend
            print("Task is queued")
            task_status = "queued"
            while True:
                result = requests.get(f"{API_URL}/get-task/{task_id}")
                if result.status_code == 200:
                    result = result.json()
                    # print(result)
                    if result["status"] == "resolved":
                        task_status = "completed"
                        print(f"Code resolved with a confidence score of {result['confidence_score']}")
                        break
                    elif task_status == "queued" and result["status"] =="resolving":
                        task_status = "resolving"
                        print("Task is being resolved")
                time.sleep(2)
            
            file = result['resolved_code']

    subprocess.run(["git", "checkout", "-b", f"auto-merge-{task_id}"], check=True)
    with open(file_path, 'w', encoding='utf-8') as f:
            f.write(file)
    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "-am", "auto-resolved merge"], check=True)
    subprocess.run(["git", "push", "--set-upstream", "origin", f"auto-merge-{task_id}"], check=True)