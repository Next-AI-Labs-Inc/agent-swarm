# Memory Management Commands

The MCP server now supports full CRUD operations on agent memories.

## Available Tools

### 1. `retrieve_memories`
Search agent knowledge base for relevant memories.

**Parameters:**
- `query` (required): Search query text
- `repo` (optional): Filter by repo (gptcoach2, ixcoach-api, etc.)
- `limit` (optional): Max results, default 5
- `event_type` (optional): Filter by type (error, success, pattern, intent)

**Example:**
```javascript
{
  "name": "retrieve_memories",
  "arguments": {
    "query": "subscription fix",
    "repo": "ixcoach-api",
    "limit": 3
  }
}
```

### 2. `add_memory`
Add a new memory entry to the knowledge base.

**Parameters:**
- `repo` (required): Repository name
- `context` (required): When to use this memory
- `lesson` (required): What to do
- `tags` (optional): Array of tags
- `event_type` (optional): error, success, pattern, or intent (default: pattern)
- `confidence` (optional): 1-10 (default: 10)
- `metadata` (optional): Additional structured data

**Example:**
```javascript
{
  "name": "add_memory",
  "arguments": {
    "repo": "ixcoach-api",
    "context": "Use when creating tasks for IX Coach work",
    "lesson": "Create GitHub issues in gptcoach2 repo using gh CLI",
    "tags": ["task-management", "github"],
    "confidence": 10
  }
}
```

### 3. `update_memory`
Update existing memory entries matching search criteria.

**Parameters:**
- `repo` (required): Repository name
- `search_tags` (optional): Find memories with these tags
- `search_text` (optional): Find memories containing this text
- `updates` (required): Object with fields to update

**Example:**
```javascript
{
  "name": "update_memory",
  "arguments": {
    "repo": "ixcoach-api",
    "search_tags": ["task-management"],
    "updates": {
      "deprecated": true,
      "lesson": "USE GITHUB ISSUES INSTEAD"
    }
  }
}
```

### 4. `remove_memory`
Remove memory entries matching search criteria.

**Parameters:**
- `repo` (required): Repository name
- `search_tags` (optional): Remove memories with these tags
- `search_text` (optional): Remove memories containing this text

**Example:**
```javascript
{
  "name": "remove_memory",
  "arguments": {
    "repo": "ixcoach-api",
    "search_tags": ["deprecated", "task-management"]
  }
}
```

## CLI Examples

### Using the log_memory.sh script (for adding):
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "ixcoach-api" \
  --type "pattern" \
  --context "When debugging auth issues" \
  --lesson "Check both Firebase and MongoDB user records" \
  --tags "auth,debugging" \
  --confidence 10
```

### Manually with node:
```bash
cd /Users/jedi/react_projects/ix/agent-swarm-mcp && node -e "
const fs = require('fs');
const logFile = './logs/ixcoach-api.jsonl';
const memory = {
  timestamp: new Date().toISOString(),
  event_type: 'pattern',
  repo: 'ixcoach-api',
  context: 'When to use this',
  lesson: 'What to do',
  confidence: 10,
  tags: ['tag1', 'tag2']
};
fs.appendFileSync(logFile, JSON.stringify(memory) + '\n');
"
```

## Common Workflows

### Deprecating Outdated Information
```javascript
// 1. Update to mark as deprecated
{
  "name": "update_memory",
  "arguments": {
    "repo": "ixcoach-api",
    "search_text": "MongoDB task management",
    "updates": {
      "deprecated": true,
      "deprecation_reason": "Use GitHub issues instead"
    }
  }
}

// 2. Or remove completely
{
  "name": "remove_memory",
  "arguments": {
    "repo": "ixcoach-api",
    "search_text": "MongoDB task management"
  }
}
```

### Correcting Mistakes
```javascript
{
  "name": "update_memory",
  "arguments": {
    "repo": "ixcoach-api",
    "search_tags": ["agent-tools"],
    "search_text": "Task Management API",
    "updates": {
      "lesson": "DEPRECATED: Use GitHub issues in gptcoach2 repo instead"
    }
  }
}
```

### Adding New Patterns
```javascript
{
  "name": "add_memory",
  "arguments": {
    "repo": "ixcoach-api",
    "context": "Use when asked about task tracking or work management",
    "lesson": "Create GitHub issues: gh issue create --repo gptcoach2 --title 'Title' --body 'Body'",
    "tags": ["github", "workflow", "task-management"],
    "event_type": "pattern",
    "confidence": 10
  }
}
```

## Log File Structure

Memories are stored in `logs/{repo}.jsonl` or `logs/{date}.jsonl`:

```jsonl
{"timestamp":"2025-10-31T07:00:00Z","event_type":"pattern","repo":"ixcoach-api","context":"When...","lesson":"Do...","confidence":10,"tags":["tag1"]}
{"timestamp":"2025-10-31T07:01:00Z","event_type":"error","repo":"gptcoach2","context":"When...","lesson":"Fix...","confidence":8,"tags":["bug"]}
```

## Best Practices

1. **Confidence Scoring**: Only use 10 if deterministically verified
2. **Context First**: Always describe WHEN to use the memory
3. **Clear Lessons**: State WHAT to do in precise, actionable terms
4. **Tag Consistently**: Use consistent tag naming (lowercase, hyphenated)
5. **Update vs Remove**: Prefer updating to deprecated=true over removing (preserves history)
6. **Search Before Adding**: Check for existing memories to avoid duplicates
