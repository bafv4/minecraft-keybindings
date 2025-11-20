#!/bin/bash

# Neon branch reset script
# Usage: ./scripts/reset-branch-from-new-schema.sh <target-branch-name>
#
# This script resets a branch to match the preview/New-Schema branch
# Typically used after deployment creates a new branch from main

set -e

if [ -z "$1" ]; then
  echo "Error: Target branch name is required"
  echo "Usage: $0 <target-branch-name>"
  exit 1
fi

TARGET_BRANCH="$1"
SOURCE_BRANCH="preview/New-Schema"

if [ -z "$NEON_API_KEY" ]; then
  echo "Error: NEON_API_KEY environment variable is not set"
  echo "Please set it with: export NEON_API_KEY=your_api_key"
  exit 1
fi

if [ -z "$NEON_PROJECT_ID" ]; then
  echo "Error: NEON_PROJECT_ID environment variable is not set"
  echo "Please set it with: export NEON_PROJECT_ID=your_project_id"
  exit 1
fi

echo "🔄 Resetting branch '$TARGET_BRANCH' from '$SOURCE_BRANCH'..."
echo ""

# Get source branch ID
echo "📋 Getting source branch ID..."
SOURCE_BRANCH_ID=$(curl -s -X GET \
  "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Accept: application/json" \
  | jq -r ".branches[] | select(.name == \"$SOURCE_BRANCH\") | .id")

if [ -z "$SOURCE_BRANCH_ID" ] || [ "$SOURCE_BRANCH_ID" == "null" ]; then
  echo "❌ Error: Source branch '$SOURCE_BRANCH' not found"
  exit 1
fi

echo "✓ Source branch ID: $SOURCE_BRANCH_ID"

# Get target branch ID
echo "📋 Getting target branch ID..."
TARGET_BRANCH_ID=$(curl -s -X GET \
  "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Accept: application/json" \
  | jq -r ".branches[] | select(.name == \"$TARGET_BRANCH\") | .id")

if [ -z "$TARGET_BRANCH_ID" ] || [ "$TARGET_BRANCH_ID" == "null" ]; then
  echo "❌ Error: Target branch '$TARGET_BRANCH' not found"
  exit 1
fi

echo "✓ Target branch ID: $TARGET_BRANCH_ID"
echo ""

# Reset target branch to source branch
echo "🔄 Resetting branch..."
RESPONSE=$(curl -s -X POST \
  "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches/$TARGET_BRANCH_ID/restore" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d "{
    \"source_branch_id\": \"$SOURCE_BRANCH_ID\"
  }")

if echo "$RESPONSE" | jq -e '.branch' > /dev/null 2>&1; then
  echo "✅ Branch reset successfully!"
  echo ""
  echo "Branch details:"
  echo "$RESPONSE" | jq '.branch | {id, name, parent_id, created_at, updated_at}'
else
  echo "❌ Error resetting branch:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi
