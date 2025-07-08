import subprocess

def get_conflicted_files():
    """Returns a list of file paths that have merge conflicts."""
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
            text=True
        )
        conflicted_files = []
        for line in result.stdout.splitlines():
            status = line[:2]
            filename = line[3:]
            # Status codes: UU = both modified (unmerged), AA = both added, etc.
            if status in {"UU", "AA", "DU", "UD", "UA", "AU"}:
                conflicted_files.append(filename)
        return conflicted_files
    except subprocess.CalledProcessError as e:
        print("Error while running git:", e.stderr)
        return []
    


import re

def extract_semantic_conflict_blocks(file_path: str):
    """
    Extracts semantic blocks (functions, classes, global code)
    that contain Git conflict markers.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        file_content = f.read()
    # Match all defs and classes (non-greedy), capturing their span
    block_pattern = re.compile(r"(def|class)\s+\w+[\s\S]*?(?=\n(def|class)\s+\w+|\Z)", re.MULTILINE)
    matches = list(block_pattern.finditer(file_content))

    conflicted_chunks = []
    covered_spans = []

    for match in matches:
        start, end = match.span()
        block = match.group(0)
        covered_spans.append((start, end))
        if "<<<<<<<" in block and "=======" in block and ">>>>>>>" in block:
            conflicted_chunks.append(block)

    # Now check global chunks: parts not covered by class/def blocks
    uncovered_parts = []
    last_end = 0
    for start, end in covered_spans:
        if last_end < start:
            uncovered_parts.append(file_content[last_end:start])
        last_end = end
    if last_end < len(file_content):
        uncovered_parts.append(file_content[last_end:])

    # Check global code for conflict markers
    for chunk in uncovered_parts:
        if "<<<<<<<" in chunk and "=======" in chunk and ">>>>>>>" in chunk:
            conflicted_chunks.append(chunk)

    return conflicted_chunks
