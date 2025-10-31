# Read from Agent Memory

## When to Query

**ALWAYS query at these task boundaries:**
- **Starting a task** - Scan for related solutions, patterns, intent
- **Planning work** - Check architectural patterns, constraints, known issues
- **Writing tests** - Look for testing patterns, common failures
- **Finishing a task** - Review if your approach matches known intent
- **Writing commits** - Verify your changes align with system intent
- **Documenting** - Include discovered intent from memory
- **Context switching** - Query new domain before starting

**Query these domains before touching:**
- Authentication, authorization, sessions, cookies, tokens
- API routes, endpoints, middleware, validation
- Database models, migrations, queries
- UI components, styling, theming (Gen3 design system)
- Build config, deployment, CI/CD
- Payment flows (Stripe, checkout)
- Feature flags, A/B tests
- Error handling, logging
- React state management, hooks
- Node modules, dependencies, package management

## How to Query

```bash
# Search by keyword
jq -c 'select(.tags[] | test("KEYWORD"; "i"))' \
  /Users/jedi/react_projects/ix/agent-knowledge/logs/*.jsonl | \
  jq -r '"[\(.timestamp | split("T")[0])] \(.repo): \(.lesson)"' | \
  tail -10

# Search by context (what was being done)
jq -c 'select(.context | test("YOUR_QUERY"; "i"))' \
  /Users/jedi/react_projects/ix/agent-knowledge/logs/*.jsonl | \
  jq -r '"[\(.timestamp | split("T")[0])] \(.lesson)"' | \
  tail -10

# Search specific repo
jq -c 'select(.repo == "gptcoach-api")' \
  /Users/jedi/react_projects/ix/agent-knowledge/logs/*.jsonl | \
  jq -r '"[\(.event_type)] \(.lesson)"' | \
  tail -10
```

## Quick Queries

**Before npm install:**
```bash
jq -c 'select(.tags[] | test("npm"; "i"))' \
  /Users/jedi/react_projects/ix/agent-knowledge/logs/*.jsonl | \
  jq -r '"\(.lesson) (\(.success_rate))"' | tail -5
```

**Before touching API routes:**
```bash
jq -c 'select((.tags[] | test("api"; "i")) and .type == "intent")' \
  /Users/jedi/react_projects/ix/agent-knowledge/logs/*.jsonl | \
  jq -r '"\(.context)\n  → \(.lesson)\n"' | tail -20
```

**Find architectural patterns:**
```bash
jq -c 'select(.type == "pattern" or .type == "intent")' \
  /Users/jedi/react_projects/ix/agent-knowledge/logs/*.jsonl | \
  jq -r '"[\(.repo)] \(.lesson)"' | tail -15
```

## What You'll Get

Each result shows:
- **Date** - When this was learned
- **Repo/System** - Where it applies
- **Lesson** - The actual knowledge
- **Success rate** - How reliable (if logged)

## Query Tips

- Search **before** you make the same mistake twice
- Use specific keywords: "build", "deploy", "auth", "api", "gen3"
- Look for `type == "intent"` to understand WHY code exists
- Check success_rate - high numbers mean proven solutions
- Limit results to preserve context: `| tail -10` or `| head -5`

## Handling Oversized Memories

If you encounter memories >800 characters:

```bash
# Truncate long lessons to first 400 chars
jq -c 'select(.tags[] | test("npm"; "i"))' $AGENT_SWARM_PATH/logs/*.jsonl | \
  jq -r '.lesson |= (if length > 400 then .[0:400] + "..." else . end) | "[\(.confidence)/10] \(.lesson)"' | \
  tail -10
```

Or filter by confidence to get only verified, concise memories:
```bash
# Only show high-confidence (9-10) memories
jq -c 'select((.confidence | tonumber) >= 9)' $AGENT_SWARM_PATH/logs/*.jsonl
```
