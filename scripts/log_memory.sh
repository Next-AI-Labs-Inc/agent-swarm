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
CONFIDENCE=""
TIMESTAMP=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --repo) REPO="$2"; shift 2 ;;
    --type) TYPE="$2"; shift 2 ;;
    --context) CONTEXT="$2"; shift 2 ;;
    --command) COMMAND="$2"; shift 2 ;;
    --lesson) LESSON="$2"; shift 2 ;;
    --tags) TAGS="$2"; shift 2 ;;
    --success-rate) SUCCESS_RATE="$2"; shift 2 ;;
    --confidence) CONFIDENCE="$2"; shift 2 ;;
    --timestamp) TIMESTAMP="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Validate required fields
if [[ -z "$REPO" ]] || [[ -z "$TYPE" ]] || [[ -z "$CONTEXT" ]] || [[ -z "$LESSON" ]]; then
  echo "Error: Missing required fields"
  echo "Usage: $0 --repo <name> --type <error|success|pattern|intent> --context <string> --lesson <string> --confidence <1-10> [--command <string>] [--tags <comma,separated>] [--success-rate <X/Y>]"
  exit 1
fi

# Validate confidence score
if [[ -n "$CONFIDENCE" ]]; then
  if ! [[ "$CONFIDENCE" =~ ^[1-9]$|^10$ ]]; then
    echo "Error: --confidence must be between 1 and 10"
    exit 1
  fi
fi

# Check lesson size and warn if too large
LESSON_LENGTH=${#LESSON}
if [[ $LESSON_LENGTH -gt 800 ]]; then
  echo ""
  echo "⚠️  WARNING: Your lesson is $LESSON_LENGTH characters (recommended: <800)"
  echo ""
  echo "For optimal context window preservation, memories should be atomic and focused."
  echo "Each memory should capture ONE specific thing (one feature, one fix, one pattern)."
  echo ""
  echo "Typical format: 3-5 sentences explaining the specific behavior."
  echo ""
  echo "Options:"
  echo "  1. Press Enter to commit this large memory anyway"
  echo "  2. Press Ctrl+C to cancel and break into atomic memories"
  echo ""
  read -p "Commit large memory? [Enter=yes, Ctrl+C=cancel]: "
fi

# Determine script location and log directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$(dirname "$SCRIPT_DIR")/logs"
LOG_FILE="$LOG_DIR/${REPO}.jsonl"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Generate agent ID (hostname + timestamp hash for uniqueness)
AGENT_ID="agent_$(hostname -s)_$$"

# Get ISO timestamp (use provided or current)
if [[ -z "$TIMESTAMP" ]]; then
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
fi

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
  --arg conf "$CONFIDENCE" \
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
    confidence: $conf,
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
