# Agent Swarm Intelligence System

**Enable swarm intelligence across all AI coding agents working in your codebase.**

## Quick Start for First-Time Users

1. Clone this repo and set environment variable:
```bash
git clone https://github.com/Next-AI-Labs-Inc/agent-swarm.git
cd agent-swarm
export AGENT_SWARM_PATH="$(pwd)"
```

2. Add to your shell profile (`.zshrc`, `.bashrc`, etc.):
```bash
export AGENT_SWARM_PATH="/path/to/agent-swarm"
```

3. Add this directive to your AI agent's system prompt:

```
Read $AGENT_SWARM_PATH/WRITE.md and $AGENT_SWARM_PATH/READ.md to learn how to capture and retrieve institutional knowledge across all agents working in this codebase.
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

## How It Works

**Write Path:**
- Agents call `$AGENT_SWARM_PATH/scripts/log_memory.sh` with structured data
- Memories stored as append-only JSONL (one file per repo/system)
- No race conditions, atomic writes

**Read Path:**
- Agents query logs with `jq` commands (keyword search)
- Optional MCP server for semantic retrieval (context-optimized)
- Returns only relevant memories (~500 tokens vs. thousands)

## Architecture

Based on Anthropic's Model Context Protocol used in Claude Code.

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Agent A   │────────▶│  log_memory  │────────▶│  JSONL      │
│   Agent B   │  append │    script    │  atomic │  Logs       │
│   Agent C   │         └──────────────┘         └─────────────┘
└─────────────┘                                          │
      │                                                  │
      │                                                  ▼
      │                                          ┌──────────────┐
      │                                          │  jq queries  │
      │                                          │  or MCP      │
      └─────────────────────────────────────────│  retrieval   │
                    query before work            └──────────────┘
```

## Installation

### 1. Install Dependencies

```bash
# Required: jq for querying
brew install jq  # macOS
# or: apt-get install jq  # Linux

# Optional: MCP server for semantic retrieval
cd mcp-server && npm install
```

### 2. Set Environment Variable

Add to your `.zshrc` or `.bashrc`:
```bash
export AGENT_SWARM_PATH="/absolute/path/to/agent-swarm"
```

Reload shell:
```bash
source ~/.zshrc  # or ~/.bashrc
```

### 3. Add to Agent Prompts

Copy the directive from `AGENT_INSTRUCTION.txt` into your coding agent's system prompt.

## Files

- **WRITE.md** - When and how agents log memories
- **READ.md** - When and how agents query memories
- **AGENT_INSTRUCTION.txt** - One-line directive for agent prompts
- **scripts/log_memory.sh** - Write helper script
- **logs/*.jsonl** - Memory storage (one file per repo)
- **mcp-server/** - Optional semantic retrieval server
- **SPEC.md** - Technical architecture
- **AGENT_GUIDE.md** - Detailed usage patterns

## Testing

```bash
cd $AGENT_SWARM_PATH
./scripts/test_mcp.sh
```

Expected: 3 test memories created, searchable by keyword.

## Example Usage

**Agent completes a task:**
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "my-frontend" \
  --type "success" \
  --context "Added dark mode toggle" \
  --lesson "toggle updates user prefs and triggers theme context refresh" \
  --tags "ui,theme,darkmode"
```

**Agent queries before work:**
```bash
jq -c 'select(.tags[] | test("darkmode"; "i"))' \
  $AGENT_SWARM_PATH/logs/*.jsonl | \
  jq -r '"[\(.timestamp | split("T")[0])] \(.lesson)"' | tail -5
```

Returns:
```
[2025-10-31] toggle updates user prefs and triggers theme context refresh
[2025-10-29] theme persists via useTheme hook, all components must consume it
```

## Success Criteria

✅ Agents capture institutional knowledge after learning  
✅ Agents query before repeating mistakes  
✅ Context windows stay lean (~500 tokens for memories)  
✅ All agents share the same knowledge base  
✅ Swarm intelligence emerges from collective learning  

## Privacy

This open-source version uses portable paths (`$AGENT_SWARM_PATH`).

All memory logs are stored locally. Never commit `.jsonl` files with private data.

## License

MIT License - See LICENSE file

## Contributing

PRs welcome! Focus areas:
- Semantic search improvements
- Multi-agent coordination patterns
- Integration with specific agent tools
- Documentation improvements
