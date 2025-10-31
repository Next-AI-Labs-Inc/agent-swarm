# Cloud Agent Setup (Codex/Remote Agents)

## For Agents Running in the Cloud

If you're a cloud-based agent (Codex, AWS Lambda, etc.) that needs access to institutional memory, follow these steps:

### 1. Set Environment Variables

In your Codex/cloud platform configuration, add:

```bash
GITHUB_TOKEN=github_pat_11A...  # Read-only token (see below)
AGENT_SWARM_PATH=/tmp/agent-memory
```

### 2. Run Initialization Script

On agent startup or before each task:

```bash
curl -s https://raw.githubusercontent.com/Next-AI-Labs-Inc/agent-swarm-internal/master/scripts/cloud_agent_init.sh | bash
```

Or if repo is already cloned:

```bash
$AGENT_SWARM_PATH/scripts/cloud_agent_init.sh
```

### 3. Query Memories

After initialization, query as documented in `READ.md`:

**Option A: Direct jq queries (faster, keyword-based)**
```bash
# Search by keyword
jq -c 'select(.tags[] | test("npm"; "i"))' \
  $AGENT_SWARM_PATH/logs/*.jsonl | \
  jq -r '"[\(.timestamp | split("T")[0])] \(.lesson)"' | tail -10

# Search by context
jq -c 'select(.context | test("auth"; "i"))' \
  $AGENT_SWARM_PATH/logs/*.jsonl | \
  jq -r '"[\(.repo)] \(.lesson)"' | tail -10
```

**Option B: MCP server (semantic retrieval, context-optimized)**

The initialization script automatically starts the MCP server. Use the `retrieve_memories` tool if your agent supports MCP.

Check MCP server status:
```bash
tail -f $AGENT_SWARM_PATH/mcp-server.log
```

## GitHub Token Setup (For Admin)

### Create Read-Only Token

1. Go to: https://github.com/settings/tokens?type=beta
2. Click "Generate new token (fine-grained)"
3. Configure:
   - **Token name:** `codex-agent-memory-read`
   - **Expiration:** 90 days (recommended)
   - **Repository access:** Only select repositories
     - Select: `Next-AI-Labs-Inc/agent-swarm-internal`
   - **Repository permissions:**
     - Contents: **Read-only** ✅
     - Metadata: **Read-only** ✅
     - All others: **No access**
4. Generate token and copy: `github_pat_11A...`
5. Store in Codex environment variables (never commit to code)

### Security Notes

✅ Token is **read-only** - cloud agents cannot modify memories  
✅ Token is **repo-scoped** - cannot access other repositories  
✅ Token **expires** - automatic revocation after 90 days  
✅ Token is **revocable** - can be deleted instantly if compromised  
✅ **Auditable** - GitHub logs all token usage  

### Token Rotation

When token expires (every 90 days):
1. Generate new token with same permissions
2. Update `GITHUB_TOKEN` in cloud platform
3. Restart affected agents

## Cloud Platform Specific Setup

### Codex
Add to environment variables in Codex settings:
```
GITHUB_TOKEN=github_pat_11A...
AGENT_SWARM_PATH=/tmp/agent-memory
```

Add to startup script:
```bash
curl -s https://raw.githubusercontent.com/Next-AI-Labs-Inc/agent-swarm-internal/master/scripts/cloud_agent_init.sh | bash
```

### AWS Lambda
Add to Lambda environment variables via AWS Console.

### Docker
Add to Dockerfile:
```dockerfile
ENV GITHUB_TOKEN=github_pat_11A...
ENV AGENT_SWARM_PATH=/app/agent-memory
RUN apt-get update && apt-get install -y git jq
```

Add to entrypoint:
```bash
/app/scripts/cloud_agent_init.sh
```

## Troubleshooting

**"fatal: could not read Username"**
- Check `GITHUB_TOKEN` is set correctly
- Token must start with `github_pat_`
- Verify token hasn't expired

**"Permission denied"**
- Token needs `Contents: Read` permission
- Verify repository name is exact: `Next-AI-Labs-Inc/agent-swarm-internal`

**"jq: command not found"**
```bash
# Linux
apt-get install jq

# macOS
brew install jq
```

**"node: command not found" or MCP server won't start**
```bash
# Linux
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# macOS
brew install node

# Verify
node --version  # Must be 18+
```

**Memories are stale**
- Run `cloud_agent_init.sh` again to pull latest
- Check local agents are pushing updates: `git log --oneline -5`

## Writing Memories (Cloud Agents Cannot)

Cloud agents have **read-only** access. To contribute memories:
1. Document findings in task output
2. Human/local agent reviews and logs via `log_memory.sh`
3. Memory syncs to cloud for other agents

This prevents cloud agents from corrupting shared memory.
