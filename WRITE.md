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

### Examples (WITH REQUIRED CONFIDENCE SCORES)

**Task completed (UX-first, deterministically verified):**
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "gptcoach-frontend" \
  --type "success" \
  --context "Dark mode toggle on /settings page persistence" \
  --lesson "When user clicks dark mode toggle in /settings, SettingsPage.js calls updateUserPreferences() which writes theme='dark' to user_preferences table. This triggers themeChanged event that ThemeContext.js listens for, causing it to update React context state. All components using useTheme() hook then re-render with dark styles. On browser refresh or new session, App.js componentDidMount reads user_preferences.theme from database before first render and initializes ThemeContext with saved value, so user sees dark theme immediately without flash of light theme." \
  --tags "ui,theme,darkmode,settings,persistence,database" \
  --confidence 10 \
  --success-rate "5/5"
```

**Oversight resolved (deterministically confirmed):**
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "gptcoach-frontend" \
  --type "error" \
  --context "npm run build fails with MODULE_NOT_FOUND for @mui/material" \
  --lesson "When running npm install in this repo, npm tries to install @mui/material v5 with React 18, but repo uses React 17. This creates peer dependency conflict causing build to fail when webpack tries to resolve @mui/material imports. Running 'npm install --legacy-peer-deps' tells npm to ignore peer dependency warnings and install @mui/material v4 which works with React 17. Build then succeeds because all dependencies resolve correctly." \
  --command "npm install --legacy-peer-deps" \
  --tags "build,npm,deps,mui,react,peer-deps" \
  --confidence 10 \
  --success-rate "5/5"
```

**Intent discovered (code inspection, not runtime verified):**
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "gptcoach-api" \
  --type "intent" \
  --context "Session creation validation flow in POST /api/sessions" \
  --lesson "When user submits login form, request hits POST /api/sessions endpoint. Validation does NOT happen in AuthMiddleware (like other routes) because SessionsController.create() needs access to unvalidated user object to initialize session with partial data before full auth completes. If validation were in middleware, middleware would reject request before controller could create session record. This is single source of truth for session creation - no other endpoint creates sessions - so validation logic must live here in controller where session creation happens." \
  --tags "api,sessions,validation,architecture,auth-flow" \
  --confidence 9
```

**Misunderstanding resolved (code traced, assumption corrected):**
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "gptcoach-api" \
  --type "intent" \
  --context "Auth middleware vs inline validation in session creation" \
  --lesson "I assumed AuthMiddleware.js handled all authentication because most protected routes use it. But when user logs in via POST /api/sessions, AuthMiddleware is NOT in the middleware chain for this route (verified in routes/sessions.js). Instead, SessionsController.create() validates credentials inline using bcrypt.compare() on submitted password. This happens because at login time there is no existing session to validate - we are creating the first session. AuthMiddleware only validates existing sessions on subsequent requests. The architectural reason: session creation is bootstrapping auth state, so it cannot depend on auth middleware that assumes auth state already exists." \
  --tags "auth,sessions,middleware,architecture,bootstrap" \
  --confidence 9
```

**Pattern recognized (observed across codebase):**
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "ix-monorepo" \
  --type "pattern" \
  --context "Component structure in all gen3 features" \
  --lesson "Every feature module under /src/features follows the same structure: .gen3-root wrapper div contains multiple .gen3-section divs, each section contains .gen3-card components. This mirrors holonic design (organism > molecule > atom). When developer creates new feature, this structure must be preserved - never flatten by putting cards directly in root, never create intermediate wrappers between sections and cards. This pattern exists because gen3-design-system.css applies responsive breakpoints, spacing, and theme styles based on this exact hierarchy. Breaking the hierarchy causes styles to fail because CSS selectors expect this structure." \
  --tags "architecture,gen3,components,holonic,css,design-system" \
  --confidence 8
```

## Fields

- `--repo` - Semantic name (can be feature, system, or actual repo name)
- `--type` - `error`, `success`, `pattern`, or `intent`
- `--context` - WHAT (specific enough to search later)
- `--lesson` - WHY or HOW (the actionable knowledge)
- `--command` - Optional: exact command that worked
- `--tags` - Keywords for retrieval
- `--success-rate` - Optional: X/Y format (how reliable is this?)
- `--confidence` - **REQUIRED:** 1-10 scale (see below)

**Always log at the appropriate level of abstraction** - component intent, module intent, feature intent, system intent. The holonic nature matters.

## CRITICAL: Confidence Scoring (REQUIRED)

**YOU MUST INCLUDE `--confidence X` ON EVERY MEMORY**

Scale:
- **10** - Deterministically confirmed (you tested it, saw the exact result, it happened)
- **9** - Verified via direct inspection (read the code, traced the flow, confirmed the logic)
- **8** - High confidence based on multiple consistent observations
- **7** - Likely based on strong evidence but not directly verified
- **6** - Educated inference from related evidence
- **5** - Reasonable assumption based on patterns
- **4** - Uncertain, needs validation
- **3** - Weak inference
- **2** - Speculation with some basis
- **1** - Pure guess

**NEVER mark something 10 unless you DETERMINISTICALLY CONFIRMED IT.**

If you:
- Assumed something without testing → NOT 10
- Inferred from code without running → NOT 10
- Think it works but didn't verify → NOT 10
- Extrapolated from similar cases → NOT 10

**Only mark 10 if:**
- You ran the code and saw the exact result
- You tested the scenario and confirmed the behavior
- You verified the reality deterministically

This prevents creating a **hallucination index** where agents trust false assumptions as fact.

## UX-First Requirement

**BEFORE logging technical details, translate to UX terms:**

### What is UX?

UX = The exact sequence of user actions and resulting system behaviors, translated from code into human-observable reality.

**WRONG:** "Modified auth middleware to check token expiry"

**RIGHT:** "When a user's session token expires (after 2 hours of inactivity), they used to see a blank screen when clicking any link. Now when their token expires and they click a link, the system detects the expired token in AuthMiddleware.js, redirects them to /login, and shows 'Your session expired. Please log in again.' This happens because the middleware now checks token.expiresAt before processing requests, and if Date.now() > token.expiresAt, it triggers the redirect flow instead of passing undefined user to the route handler which caused the blank screen."

**Key elements:**
1. **Exact user actions** - "when user clicks any link"
2. **Specific conditions** - "after 2 hours of inactivity", "token expires", "Date.now() > token.expiresAt"
3. **Cascading behavior** - what happens, then what happens next, because of what
4. **File/function precision** - "AuthMiddleware.js checks token.expiresAt"
5. **Before/After reality** - "used to see blank screen... now shows message"
6. **Technical cause in UX terms** - "undefined user to route handler which caused blank screen"

**DO NOT:**
- Abstract away details ("improved error handling")
- Separate before/after into different sections
- Use code variable names without translation ("req.user is null")
- Skip the causal chain (why → what → result)

**DO:**
- Show the exact user journey leading to the gap
- Translate conditions into observable reality
- Maintain technical precision while using human terms
- Connect cause → effect → user experience in one narrative

### Template for UX Translation

```
When user does [ACTION] under conditions [CONDITION_TRANSLATED_TO_UX],
the system [CURRENT_BEHAVIOR] because [TECHNICAL_CAUSE_IN_UX_TERMS].
[If fixing:] Now it [NEW_BEHAVIOR] because [FILE.js FUNCTION] does [SPECIFIC_CHANGE_IN_UX_TERMS],
which causes [CASCADING_EFFECT] resulting in user experiencing [FINAL_OUTCOME].
```
