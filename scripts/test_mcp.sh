#!/bin/bash
# Simple test to verify MCP server can retrieve memories

set -e

echo "Testing Agent Knowledge System..."
echo ""

# Step 1: Create test memories
echo "Step 1: Creating test memories..."

./agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach2" --type "error" \
  --context "npm install permission error on CI" \
  --command "sudo chown -R \$USER . && npm ci" \
  --lesson "always verify directory ownership before npm operations" \
  --tags "npm,permissions,ci" \
  --success-rate "5/5"

./agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach2" --type "success" \
  --context "Fixed React build memory error" \
  --command "NODE_OPTIONS=--max-old-space-size=8192 npm run build" \
  --lesson "increase Node heap size for large builds" \
  --tags "react,build,memory" \
  --success-rate "4/4"

./agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach2" --type "pattern" \
  --context "API route development workflow" \
  --lesson "update Swagger docs before submitting PR" \
  --tags "api,swagger,workflow" \
  --success-rate "10/10"

echo "✓ Created 3 test memories"
echo ""

# Step 2: Verify JSONL structure
echo "Step 2: Verifying JSONL structure..."
ENTRY_COUNT=$(jq -s 'length' agent-knowledge/logs/gptcoach2.jsonl)
echo "✓ Found $ENTRY_COUNT entries in gptcoach2.jsonl"
echo ""

# Step 3: Show what was logged
echo "Step 3: Memories logged:"
jq -r '"\(.event_type | ascii_upcase): \(.lesson) [\(.tags | join(", "))]"' agent-knowledge/logs/gptcoach2.jsonl
echo ""

# Step 4: Manual query test (simulating what MCP would do)
echo "Step 4: Testing keyword search (simulating MCP retrieval)..."
echo "Query: 'npm'"
echo ""
jq -c 'select(.context | test("npm"; "i"))' agent-knowledge/logs/gptcoach2.jsonl | \
  jq -r '"  → \(.context)\n    Lesson: \(.lesson) (\(.success_rate) success)"'
echo ""

echo "✅ Write system verified!"
echo ""
echo "Next steps:"
echo "1. Start MCP server: cd agent-knowledge/mcp-server && npm start"
echo "2. Add to Claude Desktop config (see README.md)"
echo "3. Test retrieval with: retrieve_memories tool in Claude"
