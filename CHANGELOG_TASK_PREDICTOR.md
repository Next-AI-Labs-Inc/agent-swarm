# Task Predictor Updates - 2025-01-24

## Changes Made

### 🎯 Default Behavior Change
- **Changed default `limit` from 5 → 3**
- Rationale: Better UX to show focused top 3, expandable to 5-10 on request
- Tool description now mentions "show 3-5 for visibility"

### 🗣️ Natural Language Recognition
Added agent training for common queries:

| User Query | Agent Behavior |
|------------|----------------|
| "What should I work on?" | `suggest_next_task({ limit: 3 })` - Show top 3 |
| "What's highest leverage?" | `suggest_next_task({ limit: 5, min_confidence: 7 })` - Top 5 high-confidence |
| "What supports churn?" | `suggest_next_task({ kpi_filter: "churn_reduction" })` - KPI-filtered |

### 🔍 New KPI Filter Parameter
Added `kpi_filter` parameter to tool:
- Filters tasks by specific KPI impact
- Values: `churn_reduction`, `conversion_increase`, `revenue_impact`, `security`, `velocity_improvement`, `user_experience`, `quality_improvement`, `observability`
- Use case: "What will reduce churn right now?"

### 📚 Documentation Updates

**New files:**
1. `/docs/AGENT_QUICK_REF.md` - Agent behavior guidelines
   - Shows correct vs incorrect patterns
   - Emphasizes showing multiple options (not picking for user)
   - Examples of good output formatting

2. `/CHANGELOG_TASK_PREDICTOR.md` - This file

**Updated files:**
1. `/docs/NEXT_TASK_PREDICTOR.md`
   - Added natural language mapping table
   - Added KPI keyword mapping
   - Updated best practices (show 3-5, don't obscure output)

2. `/mcp-server/index.js`
   - Added `kpiFilter` parameter support
   - Updated tool description with aliases
   - Changed default limit to 3

### 🧠 Memory Training Added

**3 new intent-mapping memories** in `shared-tools`:
1. "What should I work on?" → Show top 3-5 with full details
2. "What's highest leverage?" → Show top 5 with scores
3. KPI-focused queries → Use `kpi_filter` parameter

**1 critical behavior pattern** in `shared-tools`:
- NEVER pick one task for user
- ALWAYS show 3-5 options with context
- User needs visibility to choose

### 🎨 Tool Description Enhancement
Updated `suggest_next_task` description to include:
- Alias suggestions: `what_should_i_work_on`, `highest_leverage_tasks`, `prioritize_by_kpi`
- Natural language trigger examples
- Clearer parameter descriptions

## Agent Behavior Changes

### ❌ OLD (Incorrect) Behavior:
```
User: "What should I work on?"
Agent: [calls tool, picks one task]
Agent: "You should work on Gen3 design system compliance."
```

### ✅ NEW (Correct) Behavior:
```
User: "What should I work on?"
Agent: [calls suggest_next_task({ limit: 3 })]
Agent: "Here are your top 3 tasks by leverage:

1. [Leverage: 8.5] Portfolio tech tags (quick win)
2. [Leverage: 6.2] Gen3 design compliance
3. [Leverage: 4.1] Admin diagnostics

Which would you like to tackle?"
```

## Testing Instructions

### 1. Restart MCP Server
```bash
pkill -f "mcp-server"
# Warp will auto-restart on next tool call
```

### 2. Test Natural Language
```
"What should I work on?"
# Expect: Top 3 tasks with full details

"What's highest leverage?"
# Expect: Top 5 high-confidence tasks

"What will support churn right now?"
# Expect: Tasks filtered by churn_reduction KPI
```

### 3. Verify Output Format
Should show:
- ✅ Leverage scores visible
- ✅ Multiple tasks (3-5)
- ✅ KPI impact listed
- ✅ Effort breakdown
- ✅ Repo and lifecycle state
- ❌ NOT: Single task picked for user

## Migration Notes

### For Existing Task Memories
No schema changes required. All existing task memories work as-is.

### For Agents Using Tool
- Update any hardcoded `limit: 5` calls to `limit: 3` (or remove, 3 is default)
- Add KPI filter logic when user mentions business goals
- Always display full output, don't summarize

### For Users
No changes required. Better UX:
- Clearer natural language support
- More focused default (3 vs 5)
- KPI-specific filtering available

## Future Enhancements

Planned but not implemented:
- [ ] `complexity_filter` parameter (e.g., "show me easy tasks")
- [ ] `tag_filter` parameter (e.g., "show me quick-wins")
- [ ] Combined filters (e.g., KPI + complexity + repo)
- [ ] Historical accuracy tracking (did high-leverage tasks actually deliver?)
- [ ] Auto-update lifecycle from git activity

## Files Modified

```
modified:   mcp-server/index.js
modified:   docs/NEXT_TASK_PREDICTOR.md
new file:   docs/AGENT_QUICK_REF.md
new file:   CHANGELOG_TASK_PREDICTOR.md
```

## Memory Additions

```
shared-tools:
- "What should I work on?" intent mapping
- "What's highest leverage?" intent mapping  
- KPI-focused query intent mapping
- CRITICAL: Agent behavior pattern (show multiple, don't pick)

gptcoach2 (test data):
- Admin diagnostics centralization
- Session diagnostics (production)
- Admin security hook (production)
- Gen3 design compliance

ixcoach-api (test data):
- Token refresh bug (blocked)

portfolio (test data):
- Tech tags quick win
```

## Rollback Instructions

If issues arise:

1. **Revert default limit:**
   ```javascript
   // Line 372 in index.js
   async function suggestNextTask({ repo = null, limit = 5, ...
   ```

2. **Remove KPI filter:**
   - Remove `kpiFilter` param from `suggestNextTask()`
   - Remove filter logic at lines 393-396
   - Remove from tool schema at lines 636-639

3. **Remove memories:**
   ```javascript
   remove_memory({ 
     repo: "shared-tools", 
     search_tags: ["intent-mapping", "agent-behavior"] 
   })
   ```

## Success Metrics

After deployment, validate:
- [ ] Agents show 3-5 tasks by default (not just 1)
- [ ] Natural language queries recognized correctly
- [ ] KPI filtering works as expected
- [ ] Users report better visibility into task options
- [ ] No regression in leverage scoring accuracy

## Questions?

See full docs:
- Algorithm: `/docs/NEXT_TASK_PREDICTOR.md`
- Agent guide: `/docs/AGENT_QUICK_REF.md`
- Testing: `/TESTING_NEXT_TASK.md`
