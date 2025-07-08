# file: cli/main.py (Executable)
import subprocess
import json
import requests
import sys
from utils import get_conflicted_files, extract_semantic_conflict_blocks, process_conflict_chunks

API_URL = "http://localhost:8000/resolve-conflict"


def main():

    conflicted_files = get_conflicted_files()

    for file_path in conflicted_files:
        chunks = extract_semantic_conflict_blocks(file_path)
        done = False
        while not done:
            response = requests.post(API_URL, json={
                "file": file_path,
                "chunks": chunks
            })
            result = response.json()
            resolved_code = result["resolved_code"]
            done = result["done"]
            with open(f"repo/{file_path}", "w") as f:
                f.write(resolved_code)

    subprocess.run(["git", "commit", "-am", "auto-resolved merge"], cwd="repo", check=True)
    subprocess.run(["git", "push"], cwd="repo", check=True)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
