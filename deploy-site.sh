#!/usr/bin/env bash
# Regenerate the site and copy static output to repo root for commit/push.
set -e
cd "$(dirname "$0")/site"
npm run build
cd ..
# Copy site/out contents to repo root (no --delete: do not remove .git or other repo files)
rsync -av site/out/ .
echo "Done. Static files updated at repo root. Commit and push to publish:"
echo "  git add -A && git status && git commit -m 'Update site' && git push"
