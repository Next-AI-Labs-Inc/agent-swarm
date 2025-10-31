# Write to Agent Memory

## When to Log

**ALWAYS log at these moments:**

1. **After completing any task** - State what you completed and the UX-specific intent it fulfills
2. **After learning code intent** - You discovered WHY something exists (at any level: function, module, feature, system, organism)
3. **After overcoming an error** - You tried something, it failed, you learned why, you fixed it
4. **After resolving a misunderstanding** - You thought X, but learned it's actually Y because Z
5. **After discovering a pattern** - You noticed how things work together holistically

## How to Log

```bash
/Users/jedi/react_projects/ix/agent-knowledge/scripts/log_memory.sh \
  --repo "SEMANTIC_NAME" \
  --type "error|success|pattern|intent" \
  --context "What you were doing or what component/system" \
  --lesson "What you learned" \
  --command "Command that worked (if applicable)" \
  --tags "keyword,tags,for,search" \
  --success-rate "X/Y"
```

### Examples

**Task completed:**
```bash
/Users/jedi/react_projects/ix/agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach-frontend" \
  --type "success" \
  --context "Added dark mode toggle to settings page" \
  --lesson "toggle updates user preferences table and triggers theme context refresh - ensures theme persists across sessions and all components respond via useTheme hook" \
  --tags "ui,theme,darkmode,settings,ux"
```

**Oversight resolved:**
```bash
/Users/jedi/react_projects/ix/agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach-frontend" \
  --type "error" \
  --context "build fails with module not found" \
  --command "npm install --legacy-peer-deps" \
  --lesson "this repo requires legacy peer deps due to React 17 + MUI v4 conflict" \
  --tags "build,npm,deps" \
  --success-rate "5/5"
```

**Intent discovered:**
```bash
/Users/jedi/react_projects/ix/agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach-api" \
  --type "intent" \
  --context "POST /api/sessions validates user before creating session" \
  --lesson "validation happens here (not in middleware) because we need user context for session initialization - this is the single source of truth for session creation" \
  --tags "api,sessions,validation,architecture"
```

**Misunderstanding resolved:**
```bash
/Users/jedi/react_projects/ix/agent-knowledge/scripts/log_memory.sh \
  --repo "gptcoach-api" \
  --type "intent" \
  --context "thought middleware handled all auth but session creation validates inline" \
  --lesson "validation is NOT in middleware for session creation - it happens in POST /api/sessions controller because we need user context for initialization. This is the single source of truth for session creation." \
  --tags "auth,sessions,middleware,architecture"
```

**Pattern recognized:**
```bash
/Users/jedi/react_projects/ix/agent-knowledge/scripts/log_memory.sh \
  --repo "ix-monorepo" \
  --type "pattern" \
  --context "all feature modules follow gen3-root > sections > cards structure" \
  --lesson "this holonic pattern (organism > molecule > atom) is intentional - never flatten it or create alternate structures without explicit approval" \
  --tags "architecture,gen3,components,holonic"
```

## Fields

- `--repo` - Semantic name (can be feature, system, or actual repo name)
- `--type` - `error`, `success`, `pattern`, or `intent`
- `--context` - WHAT (specific enough to search later)
- `--lesson` - WHY or HOW (the actionable knowledge)
- `--command` - Optional: exact command that worked
- `--tags` - Keywords for retrieval
- `--success-rate` - Optional: X/Y format (how reliable is this?)

**Always log at the appropriate level of abstraction** - component intent, module intent, feature intent, system intent. The holonic nature matters.
