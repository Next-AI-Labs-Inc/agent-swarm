# Testing the Next Task Predictor

## Setup

The new `suggest_next_task` MCP tool has been implemented. To activate it:

### 1. Restart the MCP Server

The MCP server must be restarted to register the new tool:

```bash
# Stop any running MCP server process
pkill -f "mcp-server"

# Restart via Warp or your MCP client
# The server will auto-restart when Warp calls it next
```

### 2. Verify Tool Registration

In Warp, ask:
```
"What MCP tools are available?"
```

You should see `suggest_next_task` listed alongside:
- `retrieve_memories`
- `add_memory`
- `update_memory`
- `remove_memory`

## Usage Examples

### Basic: What should I work on?
```
"What should I work on next?"
```

This will invoke:
```javascript
suggest_next_task({ limit: 5 })
```

### Filtered by Repo
```
"What should I work on next in gptcoach2?"
```

This will invoke:
```javascript
suggest_next_task({ repo: "gptcoach2", limit: 5 })
```

### High-Confidence Tasks Only
```
"Show me top 10 high-confidence tasks"
```

This will invoke:
```javascript
suggest_next_task({ limit: 10, min_confidence: 8 })
```

## Test Data

I've already added 6 test task memories:

1. **gptcoach2**: Admin diagnostics logging centralization (planned, medium complexity)
2. **gptcoach2**: Session diagnostics canonical logging (production, low complexity)
3. **gptcoach2**: Admin security verification hook (production, low complexity)
4. **ixcoach-api**: Token refresh auth bug (blocked, critical complexity)
5. **gptcoach2**: Gen3 design system compliance (in_progress, medium complexity)
6. **portfolio**: Tech tags for projects (planned, low complexity, quick-win)

### Expected Prioritization

Based on leverage scoring, you should see roughly:

**High Leverage (>5.0):**
- Portfolio tech tags (quick win, low effort, conversion impact)
- Gen3 design system (in progress = momentum bonus)

**Medium Leverage (2.0-5.0):**
- Admin diagnostics centralization (high impact, moderate effort)

**Low Leverage (<2.0):**
- Token refresh bug (blocked + critical complexity = high friction)

**Not Listed:**
- Production tasks (session diagnostics, admin security) are excluded

## Validating the Algorithm

### Test 1: Basic Functionality
```bash
# Should return 6 tasks (excluding 2 production tasks)
suggest_next_task({ limit: 10 })
```

### Test 2: Repo Filter
```bash
# Should return only gptcoach2 tasks (2-3 tasks)
suggest_next_task({ repo: "gptcoach2", limit: 10 })
```

### Test 3: Confidence Filter
```bash
# Should filter out the blocked auth bug (confidence: 7)
suggest_next_task({ min_confidence: 8, limit: 10 })
```

### Test 4: Verify Scoring Components

Each task output shows:
```
🔍 Scoring: Impact=X.X, Effort=Y.Y, Friction=Z.Zx
```

Verify:
- **Blocked auth bug** has `Friction=1.4x` (blocked + 2 dependencies)
- **Quick-win portfolio** has low `Effort` score (~1-2)
- **Gen3 design** has high `Impact` score (3 KPIs)

## Adding More Tasks

To test different scenarios:

### High-Impact Feature
```javascript
add_memory({
  repo: "gptcoach2",
  context: "Implement AI-powered session summaries",
  lesson: "Add LLM endpoint to generate session insights and coaching recommendations",
  tags: ["feature", "ai", "task"],
  confidence: 8,
  metadata: {
    lifecycle_state: "planned",
    kpi_impact: ["conversion_increase", "user_experience", "quality_improvement"],
    estimated_loc: 600,
    file_count: 12,
    complexity: "high",
    dependencies: []
  }
})
```

### Quick Win
```javascript
add_memory({
  repo: "gptcoach2",
  context: "Add loading spinner to slow queries",
  lesson: "Show skeleton UI while admin logs and session diagnostics load",
  tags: ["bug", "ux", "task", "quick-win"],
  confidence: 10,
  metadata: {
    lifecycle_state: "planned",
    kpi_impact: ["user_experience"],
    estimated_loc: 30,
    file_count: 2,
    complexity: "low",
    dependencies: []
  }
})
```

### Blocked Epic
```javascript
add_memory({
  repo: "ixcoach-api",
  context: "Migrate to microservices architecture",
  lesson: "Decompose monolith into auth, coaching, admin, and analytics services",
  tags: ["feature", "architecture", "task", "blocked"],
  confidence: 6,
  metadata: {
    lifecycle_state: "blocked",
    kpi_impact: ["velocity_improvement", "quality_improvement", "observability"],
    estimated_loc: 5000,
    file_count: 100,
    complexity: "critical",
    dependencies: ["service-mesh", "api-gateway", "docker-orchestration"]
  }
})
```

## Updating Task State

After completing a task, update it:

```javascript
update_memory({
  repo: "portfolio",
  search_text: "tech tags",
  updates: {
    lifecycle_state: "production",
    metadata: { deployed_at: "2025-01-24T15:00:00Z" }
  }
})
```

Then run `suggest_next_task()` again—the completed task should disappear from suggestions.

## Troubleshooting

### Tool Not Found
- Restart MCP server
- Check Warp MCP configuration
- Verify `index.js` changes are saved

### No Tasks Returned
```
No tasks found. Try adding task memories with metadata like:
- lifecycle_state: 'planned', 'in_progress', 'testing'
- kpi_impact: ['churn_reduction', 'conversion_increase']
- estimated_loc: 150
- complexity: 'medium'
```

Solution: Add task-tagged memories with proper metadata

### Unexpected Ordering
- Check `confidence` values (low confidence tasks deprioritized)
- Verify `kpi_impact` arrays (missing = default low priority)
- Review `complexity` and `estimated_loc` (high values = high effort)
- Check `lifecycle_state` (blocked = high friction)

## Integration Pattern

For agent workflows:

1. **Morning standup**: `suggest_next_task({ limit: 3 })` → pick top item
2. **During work**: Update state to `in_progress`
3. **After completion**: Update state to `testing` or `production`
4. **Sprint planning**: `suggest_next_task({ limit: 10, min_confidence: 8 })`

## Next Steps

Once validated:
- [ ] Adjust KPI weights in `index.js` based on current priorities
- [ ] Add more task memories with proper metadata
- [ ] Integrate into daily agent routines
- [ ] Track leverage accuracy over time
- [ ] Consider ML training on completion data

## Questions?

See full documentation: `/Users/jedi/react_projects/ix/agent-swarm-mcp/docs/NEXT_TASK_PREDICTOR.md`

Or retrieve related memories:
```
retrieve_memories({ query: "task prioritization leverage" })
```
