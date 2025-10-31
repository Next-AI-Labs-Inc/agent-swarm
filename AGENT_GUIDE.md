# Agent Knowledge System - Usage Guide

## Quick Start

### Writing Memories (After Solving Problems)

When you solve an error, discover a pattern, or find a working solution:

```bash
./agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach2" \
  --type "error" \
  --context "npm install failed with EACCES on node_modules" \
  --command "sudo chown -R $USER . && npm ci" \
  --lesson "always verify directory ownership before npm operations in this repo" \
  --tags "npm,permissions,node_modules" \
  --success-rate "3/3"
```

**When to log:**
- After any error that took >1 attempt to fix
- When you discover a reusable pattern
- After confirming a solution works reliably

**Required fields:**
- `--repo`: Current repository name (use `basename $PWD`)
- `--type`: `error`, `success`, or `pattern`
- `--context`: What you were trying to do
- `--lesson`: What you learned (actionable advice)

**Optional fields:**
- `--command`: The exact command that worked
- `--tags`: Comma-separated keywords for retrieval
- `--success-rate`: Format `X/Y` (e.g., "5/5" means worked 5/5 times)

### Retrieving Memories (Before Starting Work)

**Option 1: Via MCP (Recommended)**

Add this MCP server to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

Then use the `retrieve_memories` tool in your prompts:
```
Before I run npm install, check agent memories for "npm install errors"
```

The MCP server will return top-5 relevant memories like:
```
**Relevant Memories (3):**

1. [2025-10-28] npm install failed with EACCES on node_modules
   Lesson: always verify directory ownership before npm operations (3/3 success)
   Command: `sudo chown -R $USER . && npm ci`
   Tags: npm, permissions, node_modules

2. [2025-10-25] node_modules corruption after git pull
   Lesson: delete node_modules and package-lock.json, then npm ci (7/8 success)
   Command: `rm -rf node_modules package-lock.json && npm ci`
   Tags: npm, corruption, git
```

**Option 2: Direct Query (Manual)**

If MCP is not available, query logs directly:

```bash
# Search for npm-related memories in current repo
REPO=$(basename $PWD)
grep -i "npm" agent-knowledge/logs/$REPO.jsonl | \
  jq -r '"[\(.timestamp | split("T")[0])] \(.context)\n   → \(.lesson)"' | \
  tail -10
```

## Examples

### Example 1: Logging an Error Solution
```bash
# You spent 30 minutes debugging a build error
./agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach2" \
  --type "error" \
  --context "React build fails with 'out of memory' error" \
  --command "NODE_OPTIONS=--max-old-space-size=8192 npm run build" \
  --lesson "increase Node heap size for large React builds in this codebase" \
  --tags "react,build,memory,node" \
  --success-rate "5/5"
```

### Example 2: Logging a Pattern Discovery
```bash
# You noticed a consistent workflow pattern
./agent-knowledge/scripts/log_memory.sh \
  --repo "ixcoach-api" \
  --type "pattern" \
  --context "Adding new API routes" \
  --lesson "always update Swagger docs in /docs/swagger.yaml before PR or routes won't appear in API explorer" \
  --tags "api,swagger,documentation,workflow"
```

### Example 3: Logging a Successful Workaround
```bash
# You found a fix for a known issue
./agent-knowledge/scripts/log_memory.sh \
  --repo "ixcoach-react-native" \
  --type "success" \
  --context "iOS simulator crashes on metro reload" \
  --command "npx expo start --clear" \
  --lesson "clear metro cache before iOS sim when experiencing reload crashes" \
  --tags "expo,ios,metro,cache" \
  --success-rate "8/10"
```

## Best Practices

### Writing Effective Memories

✅ **Good lesson:** "Run `npm ci` instead of `npm install` in CI to ensure lockfile consistency"
❌ **Bad lesson:** "Fixed npm issue"

✅ **Good context:** "Cypress E2E tests fail with 'cy.visit() network timeout' on CI"
❌ **Bad context:** "Tests broken"

✅ **Good tags:** "cypress,e2e,timeout,ci,network"
❌ **Bad tags:** "bug"

### Querying Effectively

When retrieving memories via MCP:
- Be specific: "git merge conflicts in package.json" > "git issues"
- Include error codes: "ENOENT when reading config file"
- Mention the operation: "database migration fails on staging"

### Maintenance

**Check your memories:**
```bash
# See all memories for current repo
jq '.' agent-knowledge/logs/$(basename $PWD).jsonl | less
```

**Count memories by type:**
```bash
jq -r '.event_type' agent-knowledge/logs/gptcoach2.jsonl | sort | uniq -c
```

**Find high-success patterns:**
```bash
jq -c 'select(.success_rate | split("/") | (.[0] | tonumber) == (.[1] | tonumber))' \
  agent-knowledge/logs/*.jsonl
```

## Troubleshooting

**Script says "command not found: jq"**
```bash
brew install jq
```

**MCP server not responding**
- Check Claude Desktop logs: `~/Library/Logs/Claude/mcp*.log`
- Verify Node version: `node --version` (needs 18+)
- Test server manually: `cd agent-knowledge/mcp-server && npm start`

**Memories not appearing in retrieval**
- Ensure tags are relevant to your query
- Check timestamp is valid ISO format
- Verify JSONL syntax: `jq empty agent-knowledge/logs/yourrepo.jsonl`

## Architecture Notes

- **Writes:** Append-only JSONL (no race conditions, atomic on macOS)
- **Reads:** MCP server loads + scores on-demand (no embedding DB needed initially)
- **Scoring:** Keyword matching + recency boost + success rate weighting
- **Scale:** Handles 10K+ entries per repo efficiently

Future: Can upgrade to vector embeddings (Chroma/FAISS) for true semantic search without changing agent interface.
