#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 \"https://apps.apple.com/app/idYOUR_APP_ID\""
  exit 1
fi

APP_STORE_URL="$1"
FILES=("src/app/page.tsx" "src/app/faq/page.tsx")
PLACEHOLDER="APP_STORE_URL_PLACEHOLDER"

FOUND=0
for FILE in "${FILES[@]}"; do
  if grep -q "$PLACEHOLDER" "$FILE"; then
    FOUND=1
    perl -pi -e "s|$PLACEHOLDER|$APP_STORE_URL|g" "$FILE"
    echo "Updated $FILE with App Store URL."
  fi
done

if [[ $FOUND -eq 0 ]]; then
  echo "Placeholder not found in expected files."
  exit 1
fi
