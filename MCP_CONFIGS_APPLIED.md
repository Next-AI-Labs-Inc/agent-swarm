# MCP Configuration Status

## ✅ Configured

### 1. Claude Desktop App
**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "agent_swarm": {
      "command": "/opt/homebrew/bin/node",
      "args": ["/Users/jedi/react_projects/ix/agent-swarm-mcp/mcp-server/index.js"],
      "env": {
        "AGENT_SWARM_PATH": "/Users/jedi/react_projects/ix/agent-swarm-mcp"
      }
    }
  }
}
```

**How to use:**
- Restart Claude Desktop app
- Use prompt: "Use retrieve_memories to search for 'npm errors'"
- Agent will see `retrieve_memories` tool available

### 2. Codex (Terminal)
**Location:** `~/.codex/config.toml`

**Configuration:**
```toml
[mcp_servers.agent_swarm]
command = "/opt/homebrew/bin/node"
args = ["/Users/jedi/react_projects/ix/agent-swarm-mcp/mcp-server/index.js"]

[mcp_servers.agent_swarm.env]
AGENT_SWARM_PATH = "/Users/jedi/react_projects/ix/agent-swarm-mcp"
```

**How to use:**
- Restart Codex
- Use prompt: "Query agent memories for authentication patterns"
- Tool will be available if Codex version supports MCP

## ❌ Not Supported

### 3. VSCode
**Status:** Does not natively support MCP  
**Alternative:** Use Cline extension or other MCP-compatible VSCode extensions  
**Reason:** VSCode requires extensions to expose MCP tools

### 4. Warp Terminal
**Status:** Does not support MCP  
**Alternative:** Agents can run direct jq queries via shell commands  
**Reason:** Terminal emulator, not an AI agent platform

### 5. iTerm
**Status:** Does not support MCP  
**Alternative:** Manual bash queries  
**Reason:** Terminal emulator, not an AI agent platform

### 6. ChatGPT Desktop App
**Status:** Does not support MCP  
**Alternative:** N/A - OpenAI uses different plugin system  
**Reason:** ChatGPT uses OpenAI plugins, not MCP protocol

### 7. ChatGPT Browser
**Status:** Does not support MCP  
**Alternative:** N/A  
**Reason:** Browser-based, uses OpenAI plugins

## Manual Query Alternative

For tools without MCP support, agents can query directly:

```bash
# Query by keyword
jq -c 'select(.tags[] | test("npm"; "i"))' \
  /Users/jedi/react_projects/ix/agent-swarm-mcp/logs/*.jsonl | \
  jq -r '"[\(.confidence)/10] [\(.timestamp | split("T")[0])] \(.lesson)"' | tail -10
```

## Testing Configurations

### Test Claude Desktop
1. Restart Claude Desktop
2. Start new conversation
3. Ask: "What MCP tools do you have available?"
4. Should see `retrieve_memories` listed
5. Test: "Use retrieve_memories to search for npm"

### Test Codex
1. Run: `codex mcp list` (if command exists)
2. Should see `agent_swarm` listed
3. Or just use natural language: "Query agent memories for X"

## Troubleshooting

**Claude Desktop: Tool not available**
- Check: `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json`
- Verify JSON is valid: `jq . ~/Library/Application\ Support/Claude/claude_desktop_config.json`
- Restart Claude Desktop completely (Cmd+Q then reopen)

**Codex: MCP not working**
- Check: `cat ~/.codex/config.toml`
- Verify TOML syntax
- Check Codex version supports MCP

**MCP Server not responding**
- Check server running: `pgrep -f "mcp-server/index.js"`
- Check logs: `tail -f /Users/jedi/react_projects/ix/agent-swarm-mcp/mcp-server.log`
- Manual start: `node /Users/jedi/react_projects/ix/agent-swarm-mcp/mcp-server/index.js`
