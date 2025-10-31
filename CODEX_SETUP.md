# Codex Agent Setup for Agent Swarm

## Adding MCP Server to Codex

Codex agents can access agent swarm memory via MCP server configuration.

### Option 1: Configuration File (Recommended)

Create or edit `~/.codex/config.toml`:

```toml
[mcp_servers.agent_swarm]
command = "node"
args = ["/Users/jedi/react_projects/ix/agent-swarm-mcp/mcp-server/index.js"]

[mcp_servers.agent_swarm.env]
AGENT_SWARM_PATH = "/Users/jedi/react_projects/ix/agent-swarm-mcp"
```

Or using `~/.agent/mcps.json`:

```json
{
  "mcpServers": {
    "agent_swarm": {
      "command": "node",
      "args": ["/Users/jedi/react_projects/ix/agent-swarm-mcp/mcp-server/index.js"],
      "env": {
        "AGENT_SWARM_PATH": "/Users/jedi/react_projects/ix/agent-swarm-mcp"
      }
    }
  }
}
```

### Option 2: Codex CLI

```bash
# If Codex has MCP: Add Server command
codex mcp add agent_swarm \
  --command "node" \
  --args "/Users/jedi/react_projects/ix/agent-swarm-mcp/mcp-server/index.js" \
  --env AGENT_SWARM_PATH="/Users/jedi/react_projects/ix/agent-swarm-mcp"
```

### Verify Setup

1. Restart Codex
2. Check available MCP servers: `codex mcp list` or check Codex settings
3. Agent should see `retrieve_memories` tool available

## Using from Codex Agent

Once configured, Codex agents can query memories:

```
Use retrieve_memories tool to search for "npm install errors" before I start this task
```

The MCP server will return context-optimized summaries (~500 tokens) instead of full logs.

### Example Query

**Agent prompt:**
```
Before fixing this auth bug, query agent memories for "authentication middleware"
```

**MCP Response:**
```
**Relevant Memories (3):**

1. [2025-10-31] Session creation validation flow
   Lesson: When user logs in via POST /api/sessions, AuthMiddleware is NOT in chain...
   Confidence: 9/10

2. [2025-10-29] Auth middleware vs inline validation
   Lesson: I assumed AuthMiddleware handled all auth but session creation validates inline...
   Confidence: 9/10

3. [2025-10-28] Token expiry handling
   Lesson: When token expires, middleware now checks token.expiresAt before routing...
   Confidence: 10/10
```

## Advantages of MCP vs Direct jq

**MCP (via retrieve_memories tool):**
- Semantic search with scoring
- Automatic filtering by relevance + recency + confidence
- Context-optimized output (~500 tokens)
- Codex handles tool invocation

**Direct jq queries:**
- Keyword matching only
- Manual filtering needed
- Returns raw JSONL (can be large)
- Agent must run bash commands

## Troubleshooting

**"agent_swarm MCP server not found"**
- Check config file path: `~/.codex/config.toml` or `~/.agent/mcps.json`
- Verify absolute paths are correct
- Restart Codex after config changes

**"Node.js not found"**
- MCP needs Node 18+
- Check: `which node` shows valid path
- Update config with absolute node path if needed

**"retrieve_memories tool not available"**
- MCP server must be running
- Check: `pgrep -f "mcp-server/index.js"`
- Check MCP logs: `~/.codex/logs/mcp-*.log`

**"No memories returned"**
- Verify logs exist: `ls /Users/jedi/react_projects/ix/agent-swarm-mcp/logs/`
- Check query specificity - try broader keywords
- Verify AGENT_SWARM_PATH env var is set in config

## Configuration for Cloud Codex

If Codex runs in cloud, use cloud agent init instead:

```toml
[mcp_servers.agent_swarm]
command = "bash"
args = ["-c", "curl -s https://raw.githubusercontent.com/Next-AI-Labs-Inc/agent-swarm-internal/master/scripts/cloud_agent_init.sh | bash && node $AGENT_SWARM_PATH/mcp-server/index.js"]

[mcp_servers.agent_swarm.env]
GITHUB_TOKEN = "github_pat_11A..."
AGENT_SWARM_PATH = "/tmp/agent-memory"
```

This will:
1. Clone agent memory repo
2. Install dependencies
3. Start MCP server
4. Make memories available via retrieve_memories tool
