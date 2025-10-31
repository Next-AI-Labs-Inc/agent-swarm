# Agent Quick Reference: Task Prioritization

## When User Asks About Next Work

### ❌ DON'T DO THIS:
```
User: "What should I work on?"
Agent: *calls suggest_next_task, picks ONE task, tells user "work on this"*
```

### ✅ DO THIS INSTEAD:
```
User: "What should I work on?"
Agent: *calls suggest_next_task({ limit: 3-5 })*
Agent: "Here are your top 3-5 tasks by leverage score:

1. [Leverage: 8.5] Portfolio tech tags (quick win)
   - Quick win, low effort, conversion impact
   
2. [Leverage: 6.2] Gen3 design compliance
   - In progress, medium complexity, UX + velocity
   
3. [Leverage: 4.1] Admin diagnostics
   - Planned, moderate effort, observability
   
Which would you like to tackle?"
```

## Natural Language Patterns

| User Query | Tool Call | Explanation |
|------------|-----------|-------------|
| "What should I work on?" | `suggest_next_task({ limit: 3 })` | Show **top 3**, let them choose |
| "What's highest leverage?" | `suggest_next_task({ limit: 5, min_confidence: 7 })` | Show **top 5** with scores visible |
| "What supports churn?" | `suggest_next_task({ kpi_filter: "churn_reduction", limit: 5 })` | Filter by KPI, show **multiple options** |
| "Show quick wins" | `retrieve_memories({ query: "quick-win task" })` | Tag-based search |
| "What's next in gptcoach2?" | `suggest_next_task({ repo: "gptcoach2", limit: 3 })` | Repo-scoped, show **top 3** |

## KPI Keyword Mapping

When user mentions a business goal, map to KPI filter:

| User Keywords | KPI Filter |
|---------------|------------|
| churn, retention, users leaving | `churn_reduction` |
| conversion, signup, trials | `conversion_increase` |
| revenue, money, sales | `revenue_impact` |
| security, auth, vulnerabilities | `security` |
| velocity, speed, faster, productivity | `velocity_improvement` |
| UX, experience, usability | `user_experience` |
| quality, bugs, stability | `quality_improvement` |
| observability, monitoring, logs | `observability` |

## Output Format

**Always show:**
- Leverage score (so user understands priority)
- Repo + lifecycle state
- Brief lesson/goal
- KPI impact (the "why")
- Complexity/effort indicators

**Example good response:**
```markdown
🎯 **Top 3 Leverage Tasks**

1. **[8.5] Add tech tags to portfolio** (portfolio, planned)
   → Quick win: Show open-source/private/production tags
   → Impact: conversion, UX | Effort: low (80 LOC, 3 files)

2. **[6.2] Gen3 design compliance** (gptcoach2, in_progress)
   → Standardize all UI to Gen3 design system
   → Impact: UX, velocity, quality | Effort: medium (300 LOC, 10 files)

3. **[4.1] Centralize admin logging** (gptcoach2, planned)
   → Consolidate telemetry to /api/admin/admin-logs
   → Impact: observability, velocity | Effort: medium (400 LOC, 8 files)

Which would you like to work on?
```

## Common Mistakes

### ❌ Mistake 1: Picking for the user
```
"Based on leverage scores, you should work on the Gen3 design system."
```
**Why wrong:** User wants to see options and choose based on context you don't have (energy level, time available, interest).

### ❌ Mistake 2: Only showing leverage score without context
```
"Task 1: Leverage 8.5
Task 2: Leverage 6.2
Task 3: Leverage 4.1"
```
**Why wrong:** User needs to understand WHY these are high leverage (KPI impact, effort, blockers).

### ❌ Mistake 3: Showing only 1 task
```
"Your highest leverage task is: Portfolio tech tags"
```
**Why wrong:** Default should be 3-5 tasks so user can choose. Only show 1 if they explicitly ask "what's THE top priority?"

### ❌ Mistake 4: Hiding the full output
```
*internally: calls suggest_next_task, sees 5 tasks*
*responds: "I analyzed your tasks, you should work on X"*
```
**Why wrong:** User loses visibility into the prioritization. Show the full output.

## Edge Cases

### User asks "What's THE top priority?"
- Show top 1-2 with strong reasoning
- Still explain why it's top (leverage breakdown)

### User asks "Show me everything"
- Use `limit: 10` or higher
- Still prioritize by leverage

### User says "I want to work on something easy"
- Retrieve memories with `complexity: "low"` tag
- Or filter by `estimated_loc < 100`
- Present as "quick wins" with leverage context

### No tasks found
- Explain: "No active task memories found. Want to add some?"
- Show example of adding a task memory

## Integration Pattern

```javascript
// Morning standup
User: "What should I work on today?"
→ suggest_next_task({ limit: 3 })
→ Show formatted list
→ User picks one

// Update state
User: "I'm working on the portfolio tags now"
→ update_memory({ search_text: "portfolio tags", updates: { lifecycle_state: "in_progress" }})

// After completion
User: "Portfolio tags are done"
→ update_memory({ search_text: "portfolio tags", updates: { lifecycle_state: "production" }})
→ Optionally: suggest_next_task({ limit: 3 }) to show what's next
```

## Remember

- **Transparency**: Show the data, don't hide it
- **Choice**: User picks, you present options
- **Context**: Include enough info to make decision (KPI, effort, blockers)
- **Consistency**: Default to 3-5 tasks unless asked otherwise
- **Scores**: Always show leverage scores so user understands ranking

The tool is called `suggest_next_task` not `pick_next_task_for_user` for a reason!
