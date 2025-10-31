# Next Task Predictor (Leverage-Based Prioritization)

## Overview

The **Next Task Predictor** is a sophisticated MCP tool that analyzes your existing task memories and calculates leverage scores to suggest what you should work on next. It factors in impact, effort, momentum, blockers, and KPI alignment to maximize efficient progress.

## Algorithm

### Leverage Formula

```
Leverage = (Impact × Confidence × (1 + Momentum)) / (Effort × Friction) × Stage
```

### Factors

#### 1. **Impact Score** (What value does this deliver?)
Based on KPI impact weights:
- `revenue_impact`: 2.5× (highest priority)
- `conversion_increase`: 2.0×
- `security`: 1.8×
- `churn_reduction`: 1.5×
- `user_experience`: 1.4×
- `quality_improvement`: 1.3×
- `velocity_improvement`: 1.2×
- `observability`: 1.1×
- `debt_reduction`: 0.9×

#### 2. **Effort Score** (How much work is required?)
Calculated from:
- `estimated_loc`: Lines of code (100 LOC = +1 effort)
- `file_count`: Files to touch (each file = +0.5 effort)
- `complexity`: 
  - `low`: 1×
  - `medium`: 2×
  - `high`: 4×
  - `critical`: 6×

#### 3. **Friction Multiplier** (What's slowing this down?)
- **Blocked tasks**: 3× friction
- **Dependencies**: +20% friction per dependency

#### 4. **Momentum Bonus** (Is work already in motion?)
- Work touched in last 7 days: +1.5× boost
- Work touched in last 30 days: +1.2× boost
- Older work: no bonus

#### 5. **Lifecycle Stage** (How mature is this?)
- `production`: 5
- `testing`: 4
- `in_progress`: 3
- `blocked`: 2.5
- `planned`: 2
- `brainstorm`: 1
- `deprecated`: 0 (excluded)

#### 6. **Confidence Factor** (How certain are we?)
- Confidence rating (1-10) / 10

## Usage

### Natural Language Queries

Agents recognize these common patterns:

**"What should I work on?"** → Shows top 3 tasks
```javascript
suggest_next_task({ limit: 3 })
```

**"What's highest leverage?"** → Shows top 5 by leverage score
```javascript
suggest_next_task({ limit: 5, min_confidence: 7 })
```

**"What will support churn right now?"** → KPI-filtered tasks
```javascript
suggest_next_task({ kpi_filter: "churn_reduction", limit: 5 })
```

**"Show me quick wins"** → Filter by tag
```javascript
retrieve_memories({ query: "quick-win task", limit: 10 })
// Then score manually or look for low complexity + high impact
```

### API Examples

### Basic Query
```javascript
// Ask what to work on next (all repos, top 3)
suggest_next_task()
```

### Filtered by Repo
```javascript
// Focus on specific repo
suggest_next_task({ repo: "gptcoach2", limit: 3 })
```

### Minimum Confidence Filter
```javascript
// Only show high-confidence tasks
suggest_next_task({ min_confidence: 8, limit: 10 })
```

### KPI-Focused Filter
```javascript
// Show tasks that impact specific KPI
suggest_next_task({ 
  kpi_filter: "conversion_increase",  // or churn_reduction, revenue_impact, etc.
  limit: 5 
})
```

## Creating Task Memories

To get accurate suggestions, add task memories with rich metadata:

### Example: High-Impact Feature
```javascript
add_memory({
  repo: "gptcoach2",
  context: "Admin diagnostics logging system needs centralization",
  lesson: "Consolidate all admin telemetry into canonical /api/admin/admin-logs endpoint",
  tags: ["feature", "admin", "observability"],
  confidence: 9,
  metadata: {
    lifecycle_state: "planned",
    kpi_impact: ["observability", "velocity_improvement", "user_experience"],
    estimated_loc: 400,
    file_count: 8,
    complexity: "medium",
    dependencies: []
  }
})
```

### Example: Quick Win (High Leverage)
```javascript
add_memory({
  repo: "ixcoach-api",
  context: "Cookie duration causing auth issues",
  lesson: "Increase session cookie from 2h to 30d until token refresh is fixed",
  tags: ["bug", "auth", "quick-win"],
  confidence: 10,
  metadata: {
    lifecycle_state: "in_progress",
    kpi_impact: ["churn_reduction", "user_experience"],
    estimated_loc: 5,
    file_count: 1,
    complexity: "low",
    dependencies: []
  }
})
```

### Example: Blocked Task
```javascript
add_memory({
  repo: "gptcoach2",
  context: "Implement advanced RAG pipeline for coaching replies",
  lesson: "Build semantic chunking + hybrid search before activating RAG v2",
  tags: ["feature", "ai", "blocked"],
  confidence: 7,
  metadata: {
    lifecycle_state: "blocked",
    kpi_impact: ["quality_improvement", "conversion_increase"],
    estimated_loc: 800,
    file_count: 15,
    complexity: "critical",
    dependencies: ["embeddings-service", "vector-db-setup"]
  }
})
```

## Output Format

```markdown
**🎯 Prioritized Tasks by Leverage Score**

**1. [Leverage: 12.5] Cookie duration causing auth issues**
   📍 Repo: ixcoach-api | State: in_progress
   💡 Increase session cookie from 2h to 30d until token refresh is fixed
   📊 Impact: churn_reduction, user_experience
   🔍 Scoring: Impact=2.9, Effort=1.1, Friction=1.0x
   🏷️  Tags: bug, auth, quick-win
   🕐 Last updated: 2025-01-23

**2. [Leverage: 8.3] Admin diagnostics logging system needs centralization**
   📍 Repo: gptcoach2 | State: planned
   💡 Consolidate all admin telemetry into canonical /api/admin/admin-logs endpoint
   📊 Impact: observability, velocity_improvement, user_experience
   🔍 Scoring: Impact=3.7, Effort=5.0, Friction=1.0x
   🏷️  Tags: feature, admin, observability
   🕐 Last updated: 2025-01-22

**3. [Leverage: 2.1] Implement advanced RAG pipeline for coaching replies**
   📍 Repo: gptcoach2 | State: blocked
   💡 Build semantic chunking + hybrid search before activating RAG v2
   📊 Impact: quality_improvement, conversion_increase
   🔍 Scoring: Impact=3.3, Effort=20.0, Friction=1.4x
   ⚠️  Dependencies: embeddings-service, vector-db-setup
   🏷️  Tags: feature, ai, blocked
   🕐 Last updated: 2025-01-20
```

## Integration with Agent Workflows

### 1. Morning Planning
```bash
# Agent asks: "What should I work on today?"
suggest_next_task({ limit: 5 })
```

### 2. Post-Completion Hook
After completing a task, update its state:
```javascript
update_memory({
  repo: "gptcoach2",
  search_text: "Cookie duration",
  updates: {
    lifecycle_state: "production",
    metadata: { deployed_at: "2025-01-23T10:00:00Z" }
  }
})
```

### 3. Sprint Planning
```bash
# Show top 10 tasks across all repos for sprint planning
suggest_next_task({ limit: 10, min_confidence: 8 })
```

### 4. Unblocking Dependencies
When a blocker is resolved:
```javascript
update_memory({
  repo: "gptcoach2",
  search_tags: ["blocked"],
  updates: {
    lifecycle_state: "planned",
    tags: ["feature", "ai", "ready"],
    metadata: { unblocked_at: "2025-01-24" }
  }
})
```

## Natural Language Mappings

Agents are trained to recognize these patterns:

| User Says | Agent Calls | Shows |
|-----------|-------------|-------|
| "What should I work on?" | `suggest_next_task({ limit: 3 })` | Top 3 tasks |
| "What's highest leverage?" | `suggest_next_task({ limit: 5, min_confidence: 7 })` | Top 5 high-confidence |
| "What supports churn?" | `suggest_next_task({ kpi_filter: "churn_reduction" })` | Churn-focused tasks |
| "What improves conversion?" | `suggest_next_task({ kpi_filter: "conversion_increase" })` | Conversion tasks |
| "What boosts revenue?" | `suggest_next_task({ kpi_filter: "revenue_impact" })` | Revenue tasks |
| "Security priorities?" | `suggest_next_task({ kpi_filter: "security" })` | Security tasks |

### KPI Filter Keywords
- **churn** → `churn_reduction`
- **conversion** → `conversion_increase`
- **revenue** → `revenue_impact`
- **security** → `security`
- **velocity/speed** → `velocity_improvement`
- **ux/experience** → `user_experience`
- **quality** → `quality_improvement`
- **observability/monitoring** → `observability`

## Best Practices

### ✅ DO:
- Always include `lifecycle_state` metadata
- Specify multiple `kpi_impact` values when applicable
- Update task state as work progresses
- Use realistic `estimated_loc` and `complexity`
- Tag tasks with `task`, `feature`, `bug`, or `improvement`
- Set confidence based on requirements clarity
- **Show top 3-5 tasks** so user can choose (don't pick one for them)

### ❌ DON'T:
- Leave tasks in `in_progress` indefinitely
- Use placeholder estimates (be realistic)
- Forget to mark dependencies
- Mix non-task memories with task memories
- Skip `kpi_impact` (defaults to low priority)
- **Obscure the full list** by picking just one task for the user

## Tuning the Algorithm

You can adjust weights in `index.js`:

```javascript
const KPI_WEIGHTS = {
  churn_reduction: 1.5,    // Adjust based on current goals
  conversion_increase: 2.0,
  revenue_impact: 2.5,
  // ... etc
};
```

Modify these based on:
- Current quarter priorities
- Product stage (growth vs. stability)
- Team capacity constraints
- Technical debt levels

## Future Enhancements

Planned improvements:
- [ ] Machine learning to learn from actual completion times vs. estimates
- [ ] Team capacity modeling (don't suggest 10 critical tasks at once)
- [ ] Risk modeling (identify tasks likely to cascade)
- [ ] Integration with calendar/sprint planning tools
- [ ] Historical leverage accuracy tracking
- [ ] Auto-update lifecycle states based on git activity

## Questions?

The leverage score helps answer:
- "What's the fastest way to move our KPIs?"
- "Which quick wins should I tackle first?"
- "What's blocking high-value work?"
- "Where should I focus during this sprint?"

Use `retrieve_memories({ query: "leverage task prioritization" })` to see this doc and related patterns.
