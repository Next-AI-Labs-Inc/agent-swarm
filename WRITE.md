# Write to Agent Memory

## When to Log

**ALWAYS log at these moments:**

1. **After completing any task** - State what you completed and the UX-specific intent it fulfills
2. **After learning code intent** - You discovered WHY something exists (at any level: function, module, feature, system, organism)
3. **After overcoming an error** - You tried something, it failed, you learned why, you fixed it
4. **After resolving a misunderstanding** - You thought X, but learned it's actually Y because Z
5. **After discovering a pattern** - You noticed how things work together holistically

## How to Log

**CRITICAL: Keep Memories Atomic**

Each memory should capture ONE specific thing:
- One feature's behavior
- One fix for one issue
- One discovered pattern
- One piece of intent

**Target size: 3-5 sentences (typically 200-800 characters)**

If your lesson is >800 characters, break it into multiple atomic memories.

**Why?** Preserves context windows when agents query memories.

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

## Atomic vs Bloated Memories

**❌ TOO BIG (1200 characters) - Don't do this:**
```bash
--lesson "In commit a3b4c5d we added SEO landing pages with multiple features including meta tags, Open Graph tags, JSON-LD schema markup for search engines, dynamic sitemap generation, robots.txt configuration, canonical URLs to prevent duplicate content penalties, Twitter card integration for social sharing, and performance optimizations like lazy loading images and code splitting for faster initial page load which improves Core Web Vitals scores that Google uses for ranking and we also added analytics tracking to measure conversion rates from organic search traffic and implemented A/B testing framework to optimize headline copy and CTA button placement based on user engagement metrics..."
```

**✅ ATOMIC (3 separate memories):**
```bash
# Memory 1: SEO meta tags
--lesson "When search engines crawl /landing pages, MetaTags component in layout.js now injects Open Graph tags and JSON-LD schema. This makes pages appear with rich previews in Google search results and social shares."

# Memory 2: Dynamic sitemap
--lesson "When deploying, build script now generates sitemap.xml from routes array. Search engines discover all landing pages automatically instead of requiring manual sitemap updates."

# Memory 3: Performance optimization
--lesson "When users visit landing pages, images lazy load and code splits per route. This reduced initial bundle size from 450KB to 180KB, improving Time to Interactive by 2.1 seconds."
```

### Examples (WITH REQUIRED CONFIDENCE SCORES)

**Task completed (UX-first, deterministically verified):**
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "gptcoach-frontend" \
  --type "success" \
  --context "When user toggles dark mode in /settings" \
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
  --context "When npm run build fails with MODULE_NOT_FOUND for @mui/material" \
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
  --context "When user submits login form to POST /api/sessions" \
  --lesson "When user submits login form, request hits POST /api/sessions endpoint. Validation does NOT happen in AuthMiddleware (like other routes) because SessionsController.create() needs access to unvalidated user object to initialize session with partial data before full auth completes. If validation were in middleware, middleware would reject request before controller could create session record. This is single source of truth for session creation - no other endpoint creates sessions - so validation logic must live here in controller where session creation happens." \
  --tags "api,sessions,validation,architecture,auth-flow" \
  --confidence 9
```

**Misunderstanding resolved (code traced, assumption corrected):**
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "gptcoach-api" \
  --type "intent" \
  --context "When trying to understand where auth validation happens for login" \
  --lesson "I assumed AuthMiddleware.js handled all authentication because most protected routes use it. But when user logs in via POST /api/sessions, AuthMiddleware is NOT in the middleware chain for this route (verified in routes/sessions.js). Instead, SessionsController.create() validates credentials inline using bcrypt.compare() on submitted password. This happens because at login time there is no existing session to validate - we are creating the first session. AuthMiddleware only validates existing sessions on subsequent requests. The architectural reason: session creation is bootstrapping auth state, so it cannot depend on auth middleware that assumes auth state already exists." \
  --tags "auth,sessions,middleware,architecture,bootstrap" \
  --confidence 9
```

**Pattern recognized (observed across codebase):**
```bash
$AGENT_SWARM_PATH/scripts/log_memory.sh \
  --repo "ix-monorepo" \
  --type "pattern" \
  --context "When creating new feature modules in /src/features" \
  --lesson "Every feature module under /src/features follows the same structure: .gen3-root wrapper div contains multiple .gen3-section divs, each section contains .gen3-card components. This mirrors holonic design (organism > molecule > atom). When developer creates new feature, this structure must be preserved - never flatten by putting cards directly in root, never create intermediate wrappers between sections and cards. This pattern exists because gen3-design-system.css applies responsive breakpoints, spacing, and theme styles based on this exact hierarchy. Breaking the hierarchy causes styles to fail because CSS selectors expect this structure." \
  --tags "architecture,gen3,components,holonic,css,design-system" \
  --confidence 8
```

## Fields

- `--repo` - Semantic name (can be feature, system, or actual repo name)
- `--type` - `error`, `success`, `pattern`, or `intent`
- `--context` - **The trigger condition** (when this situation occurs, when agent is doing X)
- `--lesson` - **The knowledge gained** (what happens, why it matters, how to handle it)
- `--command` - Optional: exact command that worked
- `--tags` - Keywords for retrieval
- `--success-rate` - Optional: X/Y format (how reliable is this?)
- `--confidence` - **REQUIRED:** 1-10 scale (see below)

### Context vs Lesson

**Context** = The situation that triggers this knowledge
- "When trying to access Google Drive"
- "When npm install fails with EACCES"
- "When user's session token expires after 2 hours"
- "When deploying to production"

**Lesson** = The complete knowledge about what happens and why
- Full UX journey showing user actions, system behavior, technical cause, result

**WRONG:**
```bash
--context "Clarified Google Drive credential requirements"
--lesson "Need OAuth or service account"
```

**RIGHT:**
```bash
--context "When trying to access Google Drive from cloud agent"
--lesson "Cloud agents need OAuth client credentials with refresh token or shared service account JSON to search Drive. Username/password alone cannot be used in automation because Google blocks non-interactive login attempts. This means when agent needs Drive access, human must provide either: 1) OAuth credentials JSON with refresh_token field populated, or 2) service account JSON with appropriate Drive API scopes. Without these, agent will get 401 Unauthorized when attempting DriveService.files().list()."
```

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
