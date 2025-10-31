# Agent Swarm Intelligence System (Internal)

**Enable swarm intelligence across all AI coding agents working in your codebase.**

## Quick Start for First-Time Users

Add this directive to your AI agent's system prompt:

```
Read /Users/jedi/react_projects/ix/agent-swarm-mcp/WRITE.md and /Users/jedi/react_projects/ix/agent-swarm-mcp/READ.md to learn how to capture and retrieve institutional knowledge across all agents working in this codebase.
```

That's it. Your agents will now:
- Capture lessons learned, intent discovered, errors resolved, patterns recognized
- Query institutional knowledge at task boundaries (starting, planning, testing, finishing)
- Build collective intelligence that prevents repeated mistakes

## What This Does

This system enables ANY coding agent (Cursor, Windsurf, Aider, Claude, etc.) to:

1. **Write memories** after completing tasks, learning intent, overcoming errors, or discovering patterns
2. **Read memories** before starting work, when context switching, or encountering problems
3. **Share knowledge** across all agents working in the codebase - creating true swarm intelligence

Based on Anthropic's Model Context Protocol architecture used in Claude Code.

## Quick Setup

### 1. Install MCP Server Dependencies

```bash
cd agent-knowledge/mcp-server
npm install
```

### 2. Test Write System

```bash
# Log a test memory
./agent-knowledge/scripts/log_memory.sh \
  --repo "test" \
  --type "pattern" \
  --context "Testing agent knowledge system" \
  --lesson "This is a test entry to verify JSONL logging works" \
  --tags "test,setup" \
  --success-rate "1/1"

# Verify it was written
cat agent-knowledge/logs/test.jsonl | jq '.'
```

Expected output: Valid JSON with all fields populated.

### 3. Test MCP Server

```bash
# Start server manually (will run on stdio)
cd agent-knowledge/mcp-server
npm start
```

In another terminal, test via MCP client or add to Claude Desktop config.

### 4. Add to Claude Desktop (Optional)

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ix-agent-knowledge": {
      "command": "node",
      "args": ["/Users/jedi/react_projects/ix/agent-knowledge/mcp-server/index.js"]
    }
  }
}
```

Restart Claude Desktop. The `retrieve_memories` tool will now be available.

## File Structure

```
agent-knowledge/
├── SPEC.md              # Technical specification
├── AGENT_GUIDE.md       # How agents use the system
├── README.md            # This file
├── logs/                # JSONL memory storage (one file per repo)
│   └── test.jsonl
├── scripts/
│   └── log_memory.sh    # Write helper script
└── mcp-server/          # Retrieval server
    ├── package.json
    └── index.js
```

## Verification Steps

Run these to confirm the system works:

### ✅ Checkpoint 1: Write System
```bash
# Log 3 different event types
./agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach2" --type "error" \
  --context "npm install permission error" \
  --lesson "chown before npm ops" --tags "npm"

./agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach2" --type "success" \
  --context "Fixed build timeout" \
  --lesson "increase Node heap" --tags "build"

./agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach2" --type "pattern" \
  --context "API route workflow" \
  --lesson "update swagger before PR" --tags "api"

# Verify all 3 entries exist
jq -r '"\(.event_type): \(.lesson)"' agent-knowledge/logs/gptcoach2.jsonl
```

Expected: 3 lines showing error/success/pattern with their lessons.

### ✅ Checkpoint 2: MCP Retrieval

After starting the MCP server and adding to Claude config:

In Claude Desktop, ask:
```
Use retrieve_memories to search for "npm" in repo "gptcoach2"
```

Expected response:
```
**Relevant Memories (1):**

1. [2025-10-31] npm install permission error
   Lesson: chown before npm ops
   Tags: npm
```

### ✅ Checkpoint 3: Context Window Savings

Compare token counts:

**Without system (reading full logs):**
```bash
wc -w agent-knowledge/logs/*.jsonl
```

**With system (MCP response):**
- Top 5 memories ≈ 300-500 tokens
- Savings scale with log size (10K entries = 100x reduction)

## Next Steps

Once verified:

1. **Integrate into agent workflows:** Add memory logging after error resolution
2. **Configure Claude Desktop:** Enable MCP server for all agents
3. **Monitor usage:** Check `agent-knowledge/logs/` growth over time
4. **Iterate:** Upgrade scoring algorithm if keyword matching isn't sufficient

## Troubleshooting

**"command not found: jq"**
```bash
brew install jq
```

**MCP server won't start**
```bash
node --version  # Must be 18+
cd agent-knowledge/mcp-server
npm install     # Ensure dependencies installed
```

**Memories not retrieving**
- Check JSONL syntax: `jq empty logs/*.jsonl`
- Verify tags are relevant to query
- Ensure timestamp is ISO 8601 format

## Technical Details

- **Storage:** Append-only JSONL (atomic writes, no database needed)
- **Retrieval:** Keyword scoring + recency + success rate weighting
- **Scale:** Handles 10K+ entries per repo with sub-second queries
- **Upgrade path:** Can add embeddings (Chroma/FAISS) without changing agent interface

See `SPEC.md` for architecture and `AGENT_GUIDE.md` for usage patterns.
