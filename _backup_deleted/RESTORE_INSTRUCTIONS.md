# Restoration Instructions

## Quick Restore Commands

### Restore a Single File
```bash
# Find the file in the backup folder, then copy it back
cp "_backup_deleted/path/to/backup-file.ext" "original/path/to/file.ext"
```

### Restore All Test Pages
```powershell
# PowerShell
New-Item -ItemType Directory -Path "app/test-chart-styles", "app/test-minimal", "app/test-mystical", "app/test-feedback" -Force
Copy-Item "_backup_deleted/app/test-pages/*" "app/test-chart-styles/page.tsx"
Copy-Item "_backup_deleted/app/test-pages/test-minimal-page.tsx" "app/test-minimal/page.tsx"
Copy-Item "_backup_deleted/app/test-pages/test-mystical-page.tsx" "app/test-mystical/page.tsx"
Copy-Item "_backup_deleted/app/test-pages/test-feedback-page.tsx" "app/test-feedback/page.tsx"
```

### Restore from Git (For Tracked Files)
```bash
# Restore a file that was tracked in Git
git checkout HEAD -- "path/to/file"

# Or restore from a specific commit
git checkout <commit-hash>^ -- "path/to/file"

# List all deleted files that Git knows about
git ls-files --deleted
```

### Restore All Markdown Documentation
```powershell
# PowerShell - Restore completion docs
Copy-Item "_backup_deleted/docs/completion-docs/*.md" "." -Force
```

### Restore All Components
```powershell
# PowerShell - Restore unused components
Copy-Item "_backup_deleted/components/unused-components/*.tsx" "components/" -Force
```

## If Server Tests Fail

1. **Identify the missing file** from the error message
2. **Check DELETED_FILES_INDEX.md** to find its backup location
3. **Copy it back** using the paths shown in the index
4. **Test again** to see if that fixes the issue
5. **If it works**, commit the restoration
6. **If still broken**, check Git history for the file

## Permanent Cleanup (After Successful Testing)

Once you've verified everything works:

```powershell
# PowerShell - Delete the backup folder permanently
Remove-Item "_backup_deleted" -Recurse -Force
```

Or manually delete the `_backup_deleted` folder from your file explorer.

## Emergency Full Restore

If you need to restore everything:

```bash
# Restore all deleted files from Git
git checkout HEAD -- $(git ls-files --deleted)

# Or restore from before cleanup
git checkout HEAD~1 -- .
```

---

**Note**: Files that were never committed to Git cannot be restored from Git, but may be in this backup folder if they existed when we deleted them.

