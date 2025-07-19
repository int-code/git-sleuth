import subprocess
from typing import Optional, Tuple

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

def extract_semantic_conflict_blocks(file_content: str):
    """
    Extracts semantic blocks (functions, classes, global code)
    that contain Git conflict markers.
    """
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


def try_simple_resolve(file_content: str, conflict_chunk: str) -> Optional[str]:
    """
    Attempts to resolve conflicts using simple heuristics.
    Returns resolved file content if successful, None otherwise.
    """
    
    if resolution := apply_simple_rules(conflict_chunk):
        file_content = file_content.replace(conflict_chunk, resolution)
        return file_content
    
    return None



def apply_simple_rules(conflict_chunk: str) -> Optional[str]:
    """
    Applies resolution rules to a single conflict chunk.
    Returns resolved chunk if rule matches, None otherwise.
    """
    # Parse the conflict chunk
    parsed = parse_conflict(conflict_chunk)
    if not parsed:
        return None
    
    head, base = parsed
    
    # Rule 1: Identical changes (except maybe whitespace)
    if normalize_code(head) == normalize_code(base):
        return head  # arbitrary pick
    
    # Rule 2: One side is empty
    if not head.strip():
        return base
    if not base.strip():
        return head
    
    # Rule 3: Version number increments
    if is_version_bump(head, base):
        return head  # typically take the higher version
    
    # Rule 4: Import/requirement changes (union)
    if is_import_conflict(head, base):
        return merge_imports(head, base)
    
    # Rule 5: Whitespace-only differences
    if re.sub(r'\s+', '', head) == re.sub(r'\s+', '', base):
        return head  # prefer one style
    
    return None

# Helper functions
def parse_conflict(chunk: str) -> Optional[Tuple[str, str]]:
    """
    Extracts HEAD and BASE parts from conflict marker
    Returns (head_content, base_content) or None if malformed
    """
    match = re.match(
        r'<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> .+',
        chunk,
        re.DOTALL
    )
    if not match:
        return None
    return match.group(1).strip(), match.group(2).strip()

def normalize_code(code: str) -> str:
    """Standardizes code for comparison"""
    code = code.strip()
    code = re.sub(r'\s+', ' ', code)  # collapse whitespace
    code = re.sub(r'["\']', '', code)  # ignore string quotes
    return code

def is_version_bump(head: str, base: str) -> bool:
    """Checks if conflict is about version numbers"""
    version_re = r'\d+\.\d+\.\d+'
    head_versions = set(re.findall(version_re, head))
    base_versions = set(re.findall(version_re, base))
    
    if not head_versions or not base_versions:
        return False
    
    # Check if one is clearly a version bump of the other
    return head_versions != base_versions and (
        all(v in head for v in base_versions) or
        all(v in base for v in head_versions)
    )

def is_import_conflict(head: str, base: str) -> bool:
    """Identifies import/requirement conflicts"""
    lines_head = {line.strip() for line in head.splitlines() if line.strip()}
    lines_base = {line.strip() for line in base.splitlines() if line.strip()}
    
    return (
        (all(line.startswith(('import ', 'from ', 'require')) for line in lines_head)) and
        (all(line.startswith(('import ', 'from ', 'require')) for line in lines_base))
    )

def merge_imports(head: str, base: str) -> str:
    """Merges two import blocks"""
    lines = set()
    for line in head.splitlines() + base.splitlines():
        if line.strip():
            lines.add(line.strip())
    return '\n'.join(sorted(lines)) + '\n'