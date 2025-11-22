#!/bin/bash

# Copy data from preview/New-Schema to target branch
# Usage: ./scripts/copy-data-from-new-schema.sh <target-database-url>
#
# This script dumps data from preview/New-Schema and restores it to the target branch
# Requires: pg_dump and psql commands

set -e

if [ -z "$1" ]; then
  echo "Error: Target database URL is required"
  echo "Usage: $0 <target-database-url>"
  echo ""
  echo "Example:"
  echo "  $0 'postgresql://user:pass@host/db?sslmode=require'"
  exit 1
fi

TARGET_DB_URL="$1"

if [ -z "$SOURCE_DB_URL" ]; then
  echo "Error: SOURCE_DB_URL environment variable is not set"
  echo "Please set it with the preview/New-Schema database URL:"
  echo "  export SOURCE_DB_URL='postgresql://user:pass@host/db?sslmode=require'"
  exit 1
fi

echo "🔄 Copying data from New-Schema to target branch..."
echo ""

# Create temporary dump file
DUMP_FILE=$(mktemp /tmp/neon-dump.XXXXXX.sql)
echo "📦 Creating database dump..."
echo "Source: preview/New-Schema"

# Dump schema and data
pg_dump "$SOURCE_DB_URL" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --format=plain \
  --file="$DUMP_FILE"

if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to dump database"
  rm -f "$DUMP_FILE"
  exit 1
fi

echo "✓ Dump created: $DUMP_FILE"
echo ""

# Restore to target
echo "📥 Restoring to target database..."
psql "$TARGET_DB_URL" < "$DUMP_FILE"

if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to restore database"
  rm -f "$DUMP_FILE"
  exit 1
fi

echo "✓ Restore completed"
echo ""

# Cleanup
rm -f "$DUMP_FILE"
echo "✅ Data copy completed successfully!"
echo ""
echo "🔍 Verifying tables..."
psql "$TARGET_DB_URL" -c "\dt" || true
