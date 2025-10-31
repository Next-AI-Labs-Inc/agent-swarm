# Maintenance Task Prioritization

## Overview

Use the `task_type_filter` parameter to focus on specific types of work: maintenance, bugs, features, improvements, or quick-wins.

## Natural Language Queries

### "What are the next 10 highest leverage maintenance tasks?"
```javascript
suggest_next_task({ 
  task_type_filter: "maintenance", 
  limit: 10 
})
```

Shows technical debt, refactoring, cleanup work prioritized by leverage.

### "Show me bugs to fix"
```javascript
suggest_next_task({ 
  task_type_filter: "bug", 
  limit: 10 
})
```

### "What quick wins can I tackle?"
```javascript
suggest_next_task({ 
  task_type_filter: "quick-win", 
  limit: 5 
})
```

## Task Type Filters

### `maintenance`
**Matches tags:**
- `maintenance`
- `refactor`
- `cleanup`
- `debt`
- `technical-debt`
- Tasks with `debt_reduction` KPI

**Use cases:**
- Code quality improvements
- Refactoring large files
- Directory restructuring
- Removing dead code
- Dependency updates
- Test coverage improvements

### `bug`
**Matches tags:**
- `bug`
- `fix`
- `hotfix`
- `regression`

**Use cases:**
- Production issues
- User-reported bugs
- Regression fixes
- Critical path failures

### `feature`
**Matches tags:**
- `feature`
- `enhancement`
- `new`

**Use cases:**
- New functionality
- User-facing additions
- API expansions

### `improvement`
**Matches tags:**
- `improvement`
- `optimization`
- `performance`

**Use cases:**
- Performance optimization
- UX polish
- Workflow enhancements

### `quick-win`
**Matches tags:**
- `quick-win`
- `easy`
- `low-hanging-fruit`

**Use cases:**
- Low-effort, high-impact tasks
- Good for end-of-day work
- Momentum builders

## Example: Maintenance Backlog

I've added 10 example maintenance tasks to gptcoach2:

1. **Refactor large files** (>300 LOC modularization)
2. **Reorganize custom AI components** (gen3/gen4 structure)
3. **Add error boundaries** (prevent cascading failures)
4. **Convert CSS to Tailwind** (design system compliance)
5. **Standardize API error handling** (centralized patterns)
6. **Add test coverage** (auth, security, payments)
7. **Extract hardcoded configs** (centralize configuration)
8. **Remove unused dependencies** (reduce bundle size)
9. **Clean up console.logs** (proper logging utility)
10. **Fix accessibility violations** (ARIA, keyboard nav)

## Query Examples

### Top 10 Maintenance by Leverage
```
User: "What are the next 10 highest leverage maintenance tasks?"
→ suggest_next_task({ task_type_filter: "maintenance", limit: 10 })
```

**Expected output:**
```markdown
🎯 **Top 10 Maintenance Tasks by Leverage**

1. [Leverage: 6.8] Remove unused dependencies
   → Quick win: Audit deps, reduce bundle 10-15%
   
2. [Leverage: 6.2] Extract hardcoded configs
   → Centralize timeouts, endpoints, feature flags
   
3. [Leverage: 5.9] Clean up console.logs
   → Replace with proper logging utility
   
4. [Leverage: 5.4] Convert CSS to Tailwind
   → Design system compliance, reduce custom CSS
   
5. [Leverage: 5.1] Reorganize custom AI components
   → Clear gen3/gen4 structure with separation
   
... (5 more)
```

### Maintenance in Specific Repo
```javascript
suggest_next_task({ 
  repo: "gptcoach2",
  task_type_filter: "maintenance", 
  limit: 10 
})
```

### High-Confidence Maintenance Only
```javascript
suggest_next_task({ 
  task_type_filter: "maintenance",
  min_confidence: 8,
  limit: 10 
})
```

### Maintenance + Specific KPI
```javascript
// Maintenance that improves velocity
suggest_next_task({ 
  task_type_filter: "maintenance",
  kpi_filter: "velocity_improvement",
  limit: 5 
})
```

## Creating Maintenance Task Memories

### Template
```javascript
add_memory({
  repo: "gptcoach2",
  context: "Brief description of the maintenance issue",
  lesson: "What needs to be done and why",
  tags: ["maintenance", "refactor", "technical-debt", "task"],
  confidence: 8,
  metadata: {
    lifecycle_state: "planned",
    kpi_impact: ["velocity_improvement", "quality_improvement", "debt_reduction"],
    estimated_loc: 150,
    file_count: 10,
    complexity: "medium",
    dependencies: []
  }
})
```

### Real Example: Refactoring Large Files
```javascript
add_memory({
  repo: "gptcoach2",
  context: "Files over 300 lines violate modularity principles",
  lesson: "Refactor large files (>300 LOC) into smaller, focused modules. Improves maintainability, reduces cognitive load, enables easier testing. Priority: files in gen3/gen4 components.",
  tags: ["maintenance", "refactor", "technical-debt", "task"],
  confidence: 8,
  metadata: {
    lifecycle_state: "planned",
    kpi_impact: ["velocity_improvement", "quality_improvement", "debt_reduction"],
    estimated_loc: 200,
    file_count: 5,
    complexity: "medium"
  }
})
```

## Maintenance Scoring Considerations

### Why Some Maintenance Ranks Higher

**High Leverage Maintenance:**
- Low effort (quick-wins like removing console.logs)
- High velocity impact (centralized configs, unused deps)
- Multiple KPI benefits (error handling → quality + UX + observability)

**Lower Leverage Maintenance:**
- High effort (comprehensive test suite)
- Narrow KPI (accessibility → just UX)
- Blocked by dependencies

### Typical Maintenance Leverage Ranges
- **Quick-win cleanup**: 6-8 leverage
- **Medium refactoring**: 4-6 leverage
- **Large architectural changes**: 2-4 leverage (high effort)
- **Blocked tech debt**: 1-2 leverage (friction penalties)

## Filtering Strategies

### Sprint Planning: Mixed Approach
```javascript
// Get top tasks of each type
const maintenance = suggest_next_task({ task_type_filter: "maintenance", limit: 3 });
const bugs = suggest_next_task({ task_type_filter: "bug", limit: 3 });
const features = suggest_next_task({ task_type_filter: "feature", limit: 3 });
```

Balance maintenance vs feature work within sprint.

### Tech Debt Sprint
```javascript
suggest_next_task({ 
  task_type_filter: "maintenance",
  limit: 20,
  min_confidence: 7
})
```

Dedicate a sprint to clearing high-confidence technical debt.

### Friday Afternoon Quick-Wins
```javascript
suggest_next_task({ 
  task_type_filter: "quick-win",
  limit: 5
})
```

Or combine filters:
```javascript
suggest_next_task({ 
  task_type_filter: "maintenance",
  limit: 10
})
// Then manually filter for complexity: "low"
```

## Updating Maintenance State

After completing maintenance:
```javascript
update_memory({
  repo: "gptcoach2",
  search_text: "console.logs",
  updates: {
    lifecycle_state: "production",
    metadata: { 
      completed_at: "2025-01-24",
      actual_loc: 65,  // Track estimates vs actuals
      actual_time_hours: 2
    }
  }
})
```

This helps improve future effort estimates.

## Anti-Patterns

### ❌ Ignoring Maintenance
**Problem:** Only filtering for `feature` type  
**Result:** Tech debt accumulates, velocity decreases over time

**Solution:** Regular maintenance sprints or 20% time allocation

### ❌ Not Tagging Maintenance
**Problem:** Technical debt tasks missing `maintenance` or `technical-debt` tags  
**Result:** Invisible to maintenance filter, never prioritized

**Solution:** Consistently tag all debt/refactor/cleanup tasks

### ❌ Underestimating Effort
**Problem:** Setting `complexity: "low"` for large refactors  
**Result:** Artificially inflated leverage, disappointment on execution

**Solution:** Be realistic with complexity and LOC estimates

## Integration with Other Filters

### Maintenance + KPI
```javascript
// Maintenance that reduces churn
suggest_next_task({ 
  task_type_filter: "maintenance",
  kpi_filter: "churn_reduction"
})
```

### Maintenance + Repo
```javascript
// Maintenance specific to API
suggest_next_task({ 
  repo: "ixcoach-api",
  task_type_filter: "maintenance",
  limit: 10
})
```

### Maintenance + Confidence
```javascript
// Only well-defined maintenance tasks
suggest_next_task({ 
  task_type_filter: "maintenance",
  min_confidence: 9,
  limit: 5
})
```

## Metrics to Track

For maintenance backlog health:

1. **Count**: How many maintenance tasks vs total?
2. **Average Leverage**: Are we prioritizing the right debt?
3. **Age**: How long sitting in backlog? (use timestamp)
4. **Completion Rate**: What % moved to production?
5. **Accuracy**: Estimated vs actual effort

Query for metrics:
```javascript
retrieve_memories({ 
  query: "maintenance technical-debt", 
  limit: 100 
})
// Analyze timestamps, lifecycle states
```

## Summary

Use `task_type_filter: "maintenance"` with `limit: 10` to get your top leverage maintenance work. The system automatically prioritizes based on:

- **Impact**: Multiple KPI benefits (velocity + quality + debt reduction)
- **Effort**: Low LOC, few files = higher leverage
- **Type**: Quick-wins (console.logs, unused deps) rank higher than large refactors

**Key Commands:**
- "What are the next 10 highest leverage maintenance tasks?"
- "Show me quick-win maintenance"
- "What maintenance improves velocity?"

All natural language, all leverage-scored, all ready to tackle! 🚀
