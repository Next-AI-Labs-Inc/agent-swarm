#!/bin/bash
# Agent memory logging helper
# Usage: ./log_memory.sh --repo "gptcoach2" --type "error" --context "..." --lesson "..." --tags "tag1,tag2"

set -e

# Parse arguments
REPO=""
TYPE=""
CONTEXT=""
COMMAND=""
LESSON=""
TAGS=""
SUCCESS_RATE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --repo) REPO="$2"; shift 2 ;;
    --type) TYPE="$2"; shift 2 ;;
    --context) CONTEXT="$2"; shift 2 ;;
    --command) COMMAND="$2"; shift 2 ;;
    --lesson) LESSON="$2"; shift 2 ;;
    --tags) TAGS="$2"; shift 2 ;;
    --success-rate) SUCCESS_RATE="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Validate required fields
if [[ -z "$REPO" ]] || [[ -z "$TYPE" ]] || [[ -z "$CONTEXT" ]] || [[ -z "$LESSON" ]]; then
  echo "Error: Missing required fields"
  echo "Usage: $0 --repo <name> --type <error|success|pattern> --context <string> --lesson <string> [--command <string>] [--tags <comma,separated>] [--success-rate <X/Y>]"
  exit 1
fi

# Determine script location and log directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$(dirname "$SCRIPT_DIR")/logs"
LOG_FILE="$LOG_DIR/${REPO}.jsonl"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Generate agent ID (hostname + timestamp hash for uniqueness)
AGENT_ID="agent_$(hostname -s)_$$"

# Get ISO timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Convert comma-separated tags to JSON array
if [[ -n "$TAGS" ]]; then
  TAG_ARRAY=$(echo "$TAGS" | jq -R 'split(",") | map(gsub("^\\s+|\\s+$"; ""))')
else
  TAG_ARRAY="[]"
fi

# Build JSON object
JSON=$(jq -n \
  --arg ts "$TIMESTAMP" \
  --arg aid "$AGENT_ID" \
  --arg repo "$REPO" \
  --arg type "$TYPE" \
  --arg ctx "$CONTEXT" \
  --arg cmd "$COMMAND" \
  --arg lesson "$LESSON" \
  --arg sr "$SUCCESS_RATE" \
  --argjson tags "$TAG_ARRAY" \
  '{
    timestamp: $ts,
    agent_id: $aid,
    repo: $repo,
    event_type: $type,
    context: $ctx,
    command: $cmd,
    lesson: $lesson,
    success_rate: $sr,
    tags: $tags
  }')

# Atomic append (use flock if available for extra safety)
if command -v flock &> /dev/null; then
  (
    flock -x 200
    echo "$JSON" >> "$LOG_FILE"
  ) 200>"$LOG_FILE.lock"
  rm -f "$LOG_FILE.lock"
else
  echo "$JSON" >> "$LOG_FILE"
fi

echo "✓ Memory logged to $LOG_FILE"
