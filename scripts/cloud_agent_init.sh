#!/bin/bash
# Cloud Agent Initialization Script for Agent Swarm Memory Access
# 
# Required environment variables (set in Codex/cloud platform):
#   GITHUB_TOKEN - GitHub fine-grained PAT with read-only access to agent-swarm-internal
#   AGENT_SWARM_PATH - Where to store memory locally (default: /tmp/agent-memory)

set -e

# Configuration
AGENT_SWARM_PATH="${AGENT_SWARM_PATH:-/tmp/agent-memory}"
REPO_URL="https://${GITHUB_TOKEN}@github.com/Next-AI-Labs-Inc/agent-swarm-internal.git"

echo "🔧 Initializing Agent Swarm Memory Access..."

# Clone repo if not exists
if [ ! -d "$AGENT_SWARM_PATH" ]; then
  echo "📦 Cloning agent memory repository..."
  git clone --quiet "$REPO_URL" "$AGENT_SWARM_PATH"
  echo "✓ Repository cloned to $AGENT_SWARM_PATH"
else
  echo "📁 Repository already exists at $AGENT_SWARM_PATH"
fi

# Pull latest memories
echo "🔄 Syncing latest agent memories..."
cd "$AGENT_SWARM_PATH"
git pull --quiet origin master

# Verify jq is available
if ! command -v jq &> /dev/null; then
  echo "⚠️  WARNING: jq not found. Install with: apt-get install jq (Linux) or brew install jq (macOS)"
  exit 1
fi

# Install MCP server dependencies if not present
if [ ! -d "$AGENT_SWARM_PATH/mcp-server/node_modules" ]; then
  echo "📦 Installing MCP server dependencies..."
  cd "$AGENT_SWARM_PATH/mcp-server"
  npm install --silent
  cd -
fi

# Start MCP server in background (if not already running)
if ! pgrep -f "node.*mcp-server/index.js" > /dev/null; then
  echo "🚀 Starting MCP server..."
  node "$AGENT_SWARM_PATH/mcp-server/index.js" > "$AGENT_SWARM_PATH/mcp-server.log" 2>&1 &
  MCP_PID=$!
  echo "✓ MCP server running (PID: $MCP_PID)"
  echo "  Logs: $AGENT_SWARM_PATH/mcp-server.log"
else
  echo "✓ MCP server already running"
fi

echo "✅ Agent Swarm Memory initialized successfully"
echo ""
echo "Available memory logs:"
ls -1 "$AGENT_SWARM_PATH/logs/"*.jsonl 2>/dev/null | xargs -n1 basename || echo "  (none yet)"
echo ""
echo "Query example:"
echo "  jq -c 'select(.tags[] | test(\"npm\"; \"i\"))' \$AGENT_SWARM_PATH/logs/*.jsonl | jq -r '[\\(.timestamp | split(\"T\")[0])] \\(.lesson)' | tail -5"
echo ""
echo "Read full docs:"
echo "  cat \$AGENT_SWARM_PATH/READ.md"
