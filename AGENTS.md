# Instructions for AI Agents

**Are you a local agent or cloud agent?**

## 🏠 LOCAL AGENTS (Running on developer's machine)

You have direct filesystem access to this repository.

### Initialization
```bash
# Set environment variable (already done if you're reading this)
export AGENT_SWARM_PATH="/Users/jedi/react_projects/ix/agent-swarm-mcp"
```

### Writing Memories
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "REPO_NAME" \
  --type "error|success|pattern|intent" \
  --context "What you were doing" \
  --lesson "What you learned" \
  --tags "keyword,tags" \
  --success-rate "X/Y"
```

### Reading Memories
```bash
# Query by keyword
jq -c 'select(.tags[] | test("npm"; "i"))' \
  $AGENT_SWARM_PATH/logs/*.jsonl | \
  jq -r '"[\(.timestamp | split("T")[0])] \(.lesson)"' | tail -10

# Full instructions
cat $AGENT_SWARM_PATH/READ.md
```

### When to Log/Query
See: `$AGENT_SWARM_PATH/WRITE.md` and `$AGENT_SWARM_PATH/READ.md`

---

## ☁️ CLOUD AGENTS (Codex, AWS Lambda, remote servers)

You do NOT have access to `/Users/jedi/...` paths. Follow these steps:

### Step 1: Check Environment Variables
Verify these are set:
```bash
echo $GITHUB_TOKEN       # Should show: github_pat_11A...
echo $AGENT_SWARM_PATH   # Should show: /tmp/agent-memory
```

If not set, ask the human to configure them in your environment.

### Step 2: Initialize (Run Once Per Session)
```bash
# Clone repo and start MCP server
curl -s https://raw.githubusercontent.com/Next-AI-Labs-Inc/agent-swarm-internal/master/scripts/cloud_agent_init.sh | bash
```

This will:
- Clone agent memory to `$AGENT_SWARM_PATH`
- Pull latest memories
- Install MCP server dependencies
- Start MCP server in background

### Step 3: Verify Initialization
```bash
# Check repo exists
ls $AGENT_SWARM_PATH

# Check MCP server is running
pgrep -f "mcp-server/index.js"

# View available memories
ls $AGENT_SWARM_PATH/logs/
```

### Step 4: Reading Memories (RELATIVE PATHS ONLY)

**❌ WRONG - Do NOT use hardcoded paths:**
```bash
jq -c 'select(.tags[] | test("npm"; "i"))' \
  /Users/jedi/react_projects/ix/agent-knowledge/logs/*.jsonl  # WRONG!
```

**✅ CORRECT - Use $AGENT_SWARM_PATH:**
```bash
jq -c 'select(.tags[] | test("npm"; "i"))' \
  $AGENT_SWARM_PATH/logs/*.jsonl | \
  jq -r '"[\(.timestamp | split("T")[0])] \(.lesson)"' | tail -10
```

### Step 5: Query Examples

**Search by keyword:**
```bash
jq -c 'select(.tags[] | test("KEYWORD"; "i"))' \
  $AGENT_SWARM_PATH/logs/*.jsonl | \
  jq -r '"[\(.timestamp | split("T")[0])] \(.repo): \(.lesson)"' | tail -10
```

**Search by repo:**
```bash
jq -c 'select(.repo == "gptcoach-api")' \
  $AGENT_SWARM_PATH/logs/*.jsonl | \
  jq -r '"[\(.event_type)] \(.lesson)"' | tail -10
```

**Find patterns/intent:**
```bash
jq -c 'select(.event_type == "pattern" or .event_type == "intent")' \
  $AGENT_SWARM_PATH/logs/*.jsonl | \
  jq -r '"[\(.repo)] \(.lesson)"' | tail -10
```

### Step 6: Writing Memories (Cloud Agents CANNOT)

Cloud agents have **read-only** access. You cannot write memories.

If you discover something valuable:
1. Document it clearly in your response to the human
2. The human or local agent will log it using `log_memory.sh`
3. It will sync to the repo for you to read next time

### Full Documentation

After initialization, read these files from your local clone:
```bash
cat $AGENT_SWARM_PATH/READ.md        # When and how to query
cat $AGENT_SWARM_PATH/CLOUD_SETUP.md # Troubleshooting
```

---

## Quick Reference Card

| Task | Local Agent | Cloud Agent |
|------|-------------|-------------|
| **Init** | Already done | `curl ... cloud_agent_init.sh \| bash` |
| **Write** | `$AGENT_SWARM_PATH/scripts/log_memory.sh ...` | ❌ Read-only |
| **Read** | `jq ... $AGENT_SWARM_PATH/logs/*.jsonl` | Same |
| **Paths** | `/Users/jedi/react_projects/ix/agent-swarm-mcp` | `$AGENT_SWARM_PATH` |
| **MCP** | Manual start if needed | Auto-started by init script |

---

## Troubleshooting

**"No such file or directory: /Users/jedi/..."**
- You're a cloud agent trying to use local paths
- Use `$AGENT_SWARM_PATH` instead
- Run initialization script first

**"AGENT_SWARM_PATH not set"**
- Ask human to set environment variable
- Should be set to `/tmp/agent-memory` for cloud agents

**"GITHUB_TOKEN not set"**
- Ask human to configure in your environment
- You need read-only GitHub token

**MCP server not responding**
- Check: `tail -f $AGENT_SWARM_PATH/mcp-server.log`
- Restart: `node $AGENT_SWARM_PATH/mcp-server/index.js &`

**No memories found**
- Run: `ls $AGENT_SWARM_PATH/logs/`
- If empty: `cd $AGENT_SWARM_PATH && git pull origin master`
