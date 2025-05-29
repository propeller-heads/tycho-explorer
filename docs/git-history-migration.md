# Git History Migration Guide

This document describes how we successfully merged multiple git repositories into a monorepo while preserving all commit history.

## Overview

We migrated from separate git repositories in subdirectories to a unified git history at the monorepo root:

**Before:**
```
tycho-explorer/
├── api/.git          # Separate git repo
├── frontend/.git     # Separate git repo
└── (root files)      # No git history
```

**After:**
```
tycho-explorer/
├── .git              # Single unified git history
├── api/              # Regular directory
├── frontend/         # Regular directory
└── (root files)      # Part of git history
```

## Migration Process

### Prerequisites

1. **Install git-filter-repo** (Git's official recommendation for history rewriting):
   ```bash
   brew install git-filter-repo
   ```

2. **Create full backups**:
   ```bash
   cp -r /path/to/project /path/to/backup
   ```

### Step 1: Clone and Prepare Repositories

1. **Clone the subdirectory repositories**:
   ```bash
   mkdir merge-work && cd merge-work
   git clone ../original/api api-clone
   git clone ../original/frontend frontend-clone
   ```

2. **Rewrite paths using git-filter-repo**:
   ```bash
   # Prefix all api files with 'api/'
   cd api-clone
   git-filter-repo --path-rename ':api/' --force
   
   # Prefix all frontend files with 'frontend/'
   cd ../frontend-clone
   git-filter-repo --path-rename ':frontend/' --force
   ```

3. **Verify the path rewriting**:
   ```bash
   git log --oneline --name-only -3
   # Should show paths like: api/src/main.rs, frontend/src/App.tsx
   ```

### Step 2: Merge Histories

1. **Create new monorepo**:
   ```bash
   mkdir tycho-explorer-merged && cd tycho-explorer-merged
   git init
   ```

2. **Add remotes and fetch**:
   ```bash
   git remote add api ../merge-work/api-clone
   git remote add frontend ../merge-work/frontend-clone
   git fetch api --tags
   git fetch frontend --tags
   ```

3. **Merge histories**:
   ```bash
   git merge --allow-unrelated-histories api/main -m "Import api repository with full history"
   git merge --allow-unrelated-histories frontend/main -m "Import frontend repository with full history"
   ```

### Step 3: Add Root Configuration

1. **Copy root-level files**:
   ```bash
   cp ../original/docker-compose.yml .
   cp ../original/Makefile .
   cp ../original/README.md .
   # ... other root files
   ```

2. **Commit root configuration**:
   ```bash
   git add .
   git commit -m "Add monorepo root configuration and documentation"
   ```

3. **Clean up remotes**:
   ```bash
   git remote remove api
   git remote remove frontend
   ```

### Step 4: Verification

1. **Verify commit count**:
   ```bash
   # Count commits in merged repo
   git log --oneline | wc -l
   
   # Should equal: original_api_commits + original_frontend_commits + merge_commits + new_commits
   ```

2. **Verify file history**:
   ```bash
   # Check that file history is preserved
   git log --follow api/src/main.rs
   git log --follow frontend/src/App.tsx
   ```

3. **Verify authors and dates**:
   ```bash
   git log --format="%h %an %ad %s" --date=short
   ```

### Step 5: Replace Original

1. **Final testing** in the merged directory
2. **Swap directories**:
   ```bash
   mv original original-backup
   mv merged original
   ```

## Key Points

### What This Preserves
- ✅ All commit messages
- ✅ Original commit authors
- ✅ Original commit dates
- ✅ File history (follow works)
- ✅ Tags and branches

### What Changes
- ❗ Commit SHAs change (due to path rewriting)
- ❗ File paths are prefixed with subdirectory names

### Safety Features
- Work on clones, not originals
- Create full backups before starting
- Verify at each step
- Keep original as backup until confirmed working

## Rollback Plan

If anything goes wrong:
```bash
rm -rf broken-merge
mv original-backup original
```

## Results

Our migration successfully merged:
- 21 commits from api/
- 164 commits from frontend/
- Added 2 merge commits
- Added 2 configuration commits
- **Total: 189 commits in unified history**

All file histories are preserved and can be viewed with `git log --follow <file>`.