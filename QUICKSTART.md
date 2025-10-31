# Agent Knowledge System - Quick Reference

## 📝 Capture Memory (After Solving Something)

```bash
./agent-knowledge/scripts/log_memory.sh \
  --repo "$(basename $PWD)" \
  --type "error|success|pattern" \
  --context "What you were doing" \
  --lesson "What you learned" \
  --command "The command that worked" \
  --tags "keyword,tags" \
  --success-rate "X/Y"
```

## 🔍 Retrieve Memories (Before Starting Work)

### Via MCP (In Claude Desktop)
```
Before running npm install, check memories for "npm errors"
```

### Via Command Line
```bash
REPO=$(basename $PWD)
jq -c 'select(.context | test("YOUR_QUERY"; "i"))' \
  agent-knowledge/logs/$REPO.jsonl | \
  jq -r '"[\(.timestamp | split("T")[0])] \(.lesson)"'
```

## ⚙️ Setup (One-Time)

1. **Install dependencies:**
   ```bash
   cd agent-knowledge/mcp-server && npm install
   ```

2. **Add to Claude Desktop config** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
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

3. **Restart Claude Desktop**

## ✅ Test It Works

```bash
./agent-knowledge/scripts/test_mcp.sh
```

Expected: 3 test memories created and searchable.

## 📚 Full Documentation

- **SPEC.md** - Technical architecture
- **AGENT_GUIDE.md** - Detailed usage patterns
- **README.md** - Setup and verification

---

**Remember:** Log after solving, retrieve before starting. Keep context windows lean.
