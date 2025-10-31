# Agent Knowledge System Specification

## Intent
Enable all agents working across IX repositories to capture learned experiences (errors, solutions, patterns) into structured logs, then retrieve only relevant memories via MCP server when needed—keeping context windows lean while building institutional knowledge.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Agent A   │────────▶│  Write API   │────────▶│  JSONL      │
│   Agent B   │  append │  (Simple)    │  atomic │  Logs       │
│   Agent C   │         └──────────────┘         └─────────────┘
└─────────────┘                                          │
      │                                                  │
      │                                                  ▼
      │                                          ┌──────────────┐
      │                                          │   MCP Server │
      │                                          │  (Semantic   │
      └─────────────────────────────────────────│   Retrieval) │
                    query via MCP                └──────────────┘
```

## Part 1: Capture (Write Path)

### Storage Structure
```
agent-knowledge/
  logs/
    gptcoach2.jsonl          # One file per repo
    ixcoach-api.jsonl
    ixcoach-landing.jsonl
    shared-tools.jsonl
  mcp-server/                # Retrieval server
  SPEC.md                    # This file
```

### Event Schema
```json
{
  "timestamp": "2025-10-31T04:58:01Z",
  "agent_id": "string",
  "repo": "gptcoach2",
  "event_type": "error|success|pattern",
  "context": "string - what was being attempted",
  "command": "string - exact command if applicable",
  "lesson": "string - what was learned",
  "success_rate": "string - X/Y format",
  "tags": ["array", "of", "keywords"]
}
```

### Agent Write Protocol
1. **When to log:**
   - After any error that required >1 attempt to resolve
   - After discovering a working solution to a known problem
   - After identifying a reusable pattern (e.g., "always check X before Y")

2. **How to log:**
   ```bash
   # Agents call this helper (creates if missing)
   ./agent-knowledge/scripts/log_memory.sh \
     --repo "$(basename $PWD)" \
     --type "error" \
     --context "npm install failed with EACCES" \
     --command "sudo chown -R $USER . && npm ci" \
     --lesson "always verify ownership before npm operations" \
     --tags "npm,permissions,node_modules"
   ```

3. **Never read the JSONL directly** (context bloat)

## Part 2: Retrieval (Read Path via MCP)

### MCP Server Responsibilities
1. **Startup:** Agents check if MCP server is running; start if not
2. **Query:** Agent sends semantic query (e.g., "npm install permissions error")
3. **Retrieval:** Server returns top-5 relevant memories as plain text summaries
4. **Re-ranking:** Prefer recent + high success rate entries

### Agent Query Protocol
```typescript
// Agent startup check
if (!isMCPRunning()) {
  startMCPServer('./agent-knowledge/mcp-server');
}

// Query during work
const memories = await mcpClient.query({
  text: "npm install fails with permission error",
  repo: "gptcoach2",  // optional filter
  limit: 5
});
// Returns: Array of {lesson, context, timestamp, success_rate}
```

### Response Format (Context-Optimized)
```markdown
**Relevant Memories (5):**

1. [2025-10-28] npm install → EACCES: Run `sudo chown -R $USER .` first (9/10 success)
2. [2025-10-25] node_modules corruption: `rm -rf node_modules && npm ci` (7/8 success)
3. [2025-10-20] package-lock conflicts: Delete lock file, regenerate (5/5 success)
...
```

## Implementation Plan

### Phase 1: Write System (No Dependencies)
- [x] Create directory structure
- [ ] Build `log_memory.sh` helper script
- [ ] Test: Agent logs 3 different event types
- [ ] Verify JSONL structure with `jq`

### Phase 2: MCP Server (Use `@modelcontextprotocol/server-memory`)
- [ ] Install MCP server package
- [ ] Configure to read from `logs/*.jsonl`
- [ ] Implement semantic search (use simple keyword matching initially)
- [ ] Test: Query returns relevant subset

### Phase 3: Integration
- [ ] Add MCP startup check to agent initialization
- [ ] Document query patterns for common scenarios
- [ ] Measure: Context tokens saved vs. full-file reads

## Technical Decisions

### Why JSONL not SQLite?
- Append-only = no lock contention
- `jq`/`grep` available everywhere
- Human-readable for debugging
- MCP server handles query optimization

### Why MCP not Direct Search?
- Agents don't implement retrieval logic
- Centralized re-ranking and scoring
- Can upgrade to embeddings later without changing agent code
- Matches Claude Code's architecture

### Why One File Per Repo?
- Agents naturally filter by current working directory
- Keeps file sizes manageable (< 10K entries per repo)
- Easy to archive old logs per project

## Success Criteria

✅ **Agent writes memory:** `log_memory.sh` creates valid JSONL  
✅ **MCP retrieves correctly:** Query "npm error" returns relevant entries  
✅ **Context window savings:** Agent uses <500 tokens for memories vs. reading full logs  
✅ **Multi-agent sharing:** Agent B sees lessons learned by Agent A  

## Future Enhancements (Out of Scope)
- Embeddings for true semantic search
- Web UI for browsing memories
- Auto-tagging with LLM
- Cross-repo pattern detection
