# Agent Swarm MCP

**Institutional memory for AI agents** - A Model Context Protocol (MCP) server that enables AI agents to learn from experience, share knowledge, and build collective intelligence across development teams.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)

---

## Why Agent Swarm?

Modern development teams use multiple AI agents (Claude, Cursor, Warp, custom tools). Each interaction teaches the agent something new about your codebase, patterns, and workflows. **But that knowledge dies when the session ends.**

Agent Swarm MCP solves this by giving agents **persistent, queryable memory** that survives across:
- ✅ Different AI tools
- ✅ Different developers
- ✅ Different projects
- ✅ Weeks, months, or years

Think of it as **institutional memory that actually works**.

---

## Key Features

### 🧠 Knowledge Management
- **Write Once, Query Everywhere**: Agents capture patterns, errors, and solutions
- **Cross-Agent Learning**: Claude learns from Cursor's mistakes, Warp inherits both
- **Smart Retrieval**: Keyword matching + recency + success rate scoring

### 🎯 Task Prioritization
- **Leverage Scoring**: Automatically prioritize work by `(Impact × Confidence) / (Effort × Friction)`
- **KPI Alignment**: Filter tasks by business goals (churn reduction, revenue, velocity)
- **Natural Language**: "What should I work on?" → Top 3 leverag tasks with context

### 🩺 Operational Health
- **Daily Checkup**: Walk through monitoring checklist (errors, metrics, customer feedback)
- **GPT Prompts**: Pre-written prompts for common checks (email scan, log analysis)
- **Customizable**: Add your own checks with direct links and instructions

### 🏷️ Semantic Organization
- **Tags**: Categorize by `bug`, `feature`, `maintenance`, `quick-win`
- **Lifecycle States**: Track `planned` → `in_progress` → `testing` → `production`
- **Confidence Levels**: 1-10 scale for how certain the knowledge is

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/YOUR_ORG/agent-swarm-mcp.git
cd agent-swarm-mcp/mcp-server
npm install
```

### 2. Add Your First Memory

```bash
node ../scripts/add_memory.js \
  --repo="your-project" \
  --context="When npm install fails with EACCES error" \
  --lesson="Run with sudo npm install --unsafe-perm or fix permissions: sudo chown -R $(whoami) ~/.npm" \
  --tags="error,npm,permissions" \
  --confidence=9
```

### 3. Query It

```bash
# Start MCP server
npm start

# In Claude/Cursor/Warp, ask:
"How do I fix npm install permission errors?"
```

The agent will retrieve your memory and apply the solution!

---

## Core Tools

### `retrieve_memories`
Search knowledge base for relevant patterns, errors, solutions.

```javascript
retrieve_memories({
  query: "authentication token refresh",
  repo: "api-service",  // optional
  limit: 5
})
```

**Returns:** Top 5 memories with context, lessons, and metadata.

---

### `suggest_next_task`
Get leverage-scored task prioritization based on impact/effort.

```javascript
suggest_next_task({
  limit: 3,
  kpi_filter: "churn_reduction",  // optional
  task_type_filter: "maintenance"  // optional
})
```

**Returns:** Prioritized tasks with leverage breakdown:
```
1. [Leverage: 8.5] Remove unused dependencies
   → Quick win: Audit deps, reduce bundle 10-15%
   Impact: velocity, debt_reduction | Effort: low (50 LOC, 1 file)
```

**Natural Language:**
- "What should I work on?" → Top 3 tasks
- "What's highest leverage?" → Top 5 by score
- "What reduces churn?" → Filtered by KPI

---

### `daily_checkup`
Operational health monitoring checklist.

```javascript
daily_checkup({ repo: "your-project" })
```

**Returns:** Walkthrough of monitoring tasks:
```
🩺 Daily Health Checkup

1. Check error tracking for new issues
   → Review last 24h for spikes, patterns
   🔗 https://your-error-tracker.com

2. Scan email for customer feedback
   💬 GPT Prompt: "Summarize customer emails from last 24h..."
```

**Natural Language:**
- "How are things going?"
- "Daily checkup?"
- "Health check?"

---

### `add_memory`
Capture new knowledge.

```javascript
add_memory({
  repo: "api-service",
  context: "When rate limit hits on /api/search",
  lesson: "Implement exponential backoff with jitter: wait = base_wait * (2^attempt) + random(0, 1000ms)",
  tags: ["api", "rate-limit", "pattern"],
  confidence: 10,
  metadata: {
    complexity: "low",
    estimated_loc: 30
  }
})
```

---

### `update_memory` & `remove_memory`
Maintain knowledge quality over time.

```javascript
// Mark as deprecated
update_memory({
  repo: "api-service",
  search_text: "old auth pattern",
  updates: { deprecated: true }
})

// Remove obsolete knowledge
remove_memory({
  repo: "api-service",
  search_tags: ["deprecated"]
})
```

---

## Task Prioritization Algorithm

### Leverage Formula

```
Leverage = (Impact × Confidence × (1 + Momentum)) / (Effort × Friction) × Stage
```

### Factors

**Impact** - KPI weights (customizable):
- Revenue impact: 2.5×
- Conversion: 2.0×
- Security: 1.8×
- Churn reduction: 1.5×
- UX: 1.4×
- Quality: 1.3×
- Velocity: 1.2×
- Observability: 1.1×
- Tech debt: 0.9×

**Effort** - Derived from:
- Estimated LOC (100 lines = +1 effort)
- File count (each file = +0.5 effort)
- Complexity: low (1×), medium (2×), high (4×), critical (6×)

**Friction** - Blockers multiply effort:
- Blocked tasks: 3× friction
- Dependencies: +20% per dependency

**Momentum** - Recent work gets bonus:
- Last 7 days: +1.5×
- Last 30 days: +1.2×

**Stage** - Lifecycle multiplier:
- Production: 5 (completed)
- Testing: 4
- In progress: 3
- Planned: 2
- Brainstorm: 1

**Confidence** - How certain is this estimate? (1-10 / 10)

### Example

```javascript
add_memory({
  repo: "frontend",
  context: "Add loading states to slow API calls",
  lesson: "Show skeleton UI while data loads - improves perceived performance",
  tags: ["ux", "task", "quick-win"],
  confidence: 10,
  metadata: {
    lifecycle_state: "planned",
    kpi_impact: ["user_experience"],
    estimated_loc: 40,
    file_count: 3,
    complexity: "low"
  }
})

// Leverage calculation:
// Impact: 1.4 (UX)
// Effort: 1 + (40/100) + (3*0.5) * 1 = 2.9
// Friction: 1 (no blockers)
// Momentum: 0 (new)
// Stage: 2 (planned)
// Confidence: 1.0 (10/10)
//
// Leverage = (1.4 * 1.0 * 1) / (2.9 * 1) * 2 = 0.97
```

Quick wins (low effort + visible impact) score highest!

---

## Operational Health Monitoring

### Daily Checkup Workflow

**Morning:**
```
You: "How are things going?"
Agent: [Shows 6-item checklist with URLs and GPT prompts]
You: [Runs through list, finds 2 issues]
You: "What should I work on?"
Agent: [Prioritizes the issues by leverage]
```

### Example Checkup Items

**Error Monitoring:**
```javascript
add_memory({
  repo: "frontend",
  context: "Check error tracking dashboard",
  lesson: "Review last 24h for: error rate spikes, new error types, affected users. Flag >20% increase from baseline.",
  tags: ["daily-checkup", "monitoring"],
  confidence: 10,
  metadata: {
    tool: "Sentry/Rollbar",
    url: "https://your-error-tracker.com"
  }
})
```

**Customer Feedback Scan:**
```javascript
add_memory({
  repo: "shared",
  context: "Scan email for customer communications",
  lesson: "Use ChatGPT to review inbox for feedback, support requests, or urgent communications.",
  tags: ["daily-checkup", "customer-success"],
  confidence: 10,
  metadata: {
    tool: "ChatGPT",
    gpt_prompt: "Review my last 24h of emails and summarize: 1) Customer issues/feedback, 2) Support requests needing attention, 3) Important comms to respond to, 4) Sentiment trends"
  }
})
```

**Metrics Review:**
```javascript
add_memory({
  repo: "backend",
  context: "Check API performance metrics",
  lesson: "Review: error rates, response times, throughput. Flag: 5xx errors, slow endpoints (>2s), failed jobs.",
  tags: ["daily-checkup", "infrastructure"],
  confidence: 9,
  metadata: {
    tool: "Datadog/New Relic",
    url: "https://your-monitoring.com"
  }
})
```

---

## Configuration

### MCP Server Config (Claude Desktop)

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agent-knowledge": {
      "command": "node",
      "args": ["/path/to/agent-swarm-mcp/mcp-server/index.js"]
    }
  }
}
```

### Customize KPI Weights

Edit `mcp-server/index.js`:

```javascript
const KPI_WEIGHTS = {
  churn_reduction: 1.5,
  conversion_increase: 2.0,
  velocity_improvement: 1.2,
  quality_improvement: 1.3,
  revenue_impact: 2.5,
  user_experience: 1.4,
  security: 1.8,
  observability: 1.1,
  debt_reduction: 0.9
};
```

Adjust based on your current priorities (e.g., boost security to 3.0 during security sprint).

---

## Architecture

### Storage
- **Format**: JSONL (JSON Lines) - one memory per line
- **Location**: `logs/{repo}.jsonl`
- **Scalability**: Tested with 10,000+ entries
- **Future**: Embeddings + vector search for semantic retrieval

### Memory Schema
```json
{
  "timestamp": "2025-01-24T10:00:00Z",
  "event_type": "pattern",  // error, success, pattern, intent
  "repo": "api-service",
  "context": "When to apply this",
  "lesson": "What to do",
  "confidence": 9,
  "tags": ["api", "caching"],
  "metadata": {
    "lifecycle_state": "production",
    "kpi_impact": ["velocity_improvement"],
    "estimated_loc": 50,
    "complexity": "low"
  }
}
```

### Retrieval Scoring
```javascript
score = keyword_matches + recency_boost + success_rate_boost

// Keyword: +1 per matching word
// Recency: Linear decay over 30 days (max +1)
// Success: (successes / attempts) * 0.5
```

---

## Use Cases

### 1. Error Pattern Library
Agents capture and retrieve error solutions:
```
Agent encounters: "ECONNREFUSED on localhost:5432"
→ Retrieves memory: "Start PostgreSQL: brew services start postgresql"
→ Auto-applies fix
```

### 2. Code Pattern Repository
Standardize approaches across team:
```
Agent asked: "How do we handle API retries?"
→ Retrieves: "Use exponential backoff with jitter pattern"
→ Shows code example from past implementation
```

### 3. Onboarding New Developers
New team member's agent learns from veterans:
```
New dev: "How do I run tests?"
→ Agent retrieves: "npm run test:watch for TDD, npm test for CI"
→ Also shows: "Common test failures and fixes"
```

### 4. Sprint Planning
Automatically prioritize backlog:
```
PM: "What should we build this sprint?"
→ Agent shows top 10 by leverage
→ Filters by: kpi_filter="conversion_increase"
→ Balances: 70% features, 30% tech debt
```

### 5. Incident Response
Capture and share outage learnings:
```
During incident: Rate limit hit on payment processor
→ Agent logs: "Scale back batch size from 100 to 25"
→ Next incident: Agent suggests fix instantly
```

### 6. Technical Debt Management
Surface highest ROI refactoring:
```
Dev: "What maintenance should I tackle?"
→ Agent shows: task_type_filter="maintenance"
→ Prioritizes: Quick wins (remove console.logs) over large refactors
```

---

## Advanced Features

### Task Type Filters

```javascript
suggest_next_task({ 
  task_type_filter: "maintenance",  // or: bug, feature, improvement, quick-win
  limit: 10 
})
```

**Type mappings:**
- `maintenance` → refactor, cleanup, debt, technical-debt
- `bug` → fix, hotfix, regression
- `feature` → enhancement, new
- `improvement` → optimization, performance
- `quick-win` → easy, low-hanging-fruit

### Combined Filters

```javascript
// Maintenance tasks that improve velocity
suggest_next_task({
  task_type_filter: "maintenance",
  kpi_filter: "velocity_improvement",
  min_confidence: 8,
  limit: 5
})

// High-confidence bugs
suggest_next_task({
  task_type_filter: "bug",
  min_confidence: 9,
  repo: "api-service"
})
```

### Lifecycle Management

```javascript
// Start work
update_memory({
  repo: "frontend",
  search_text: "loading states",
  updates: {
    lifecycle_state: "in_progress",
    metadata: { started_at: "2025-01-24" }
  }
})

// Complete work
update_memory({
  repo: "frontend",
  search_text: "loading states",
  updates: {
    lifecycle_state: "production",
    metadata: {
      completed_at: "2025-01-25",
      actual_loc: 38,  // vs estimated 40
      actual_time_hours: 1.5
    }
  }
})
```

Track estimates vs actuals to improve future leverage scoring!

---

## Documentation

- **[NEXT_TASK_PREDICTOR.md](docs/NEXT_TASK_PREDICTOR.md)** - Full algorithm details
- **[AGENT_QUICK_REF.md](docs/AGENT_QUICK_REF.md)** - Agent behavior patterns
- **[DAILY_CHECKUP.md](docs/DAILY_CHECKUP.md)** - Operational monitoring guide
- **[MAINTENANCE_TASKS.md](docs/MAINTENANCE_TASKS.md)** - Tech debt management

---

## Roadmap

- [ ] **Vector embeddings** - Semantic search beyond keywords
- [ ] **Team analytics** - Leverage accuracy tracking over time
- [ ] **Auto-tagging** - ML-powered tag suggestions
- [ ] **GitHub integration** - Auto-create issues from high-leverage tasks
- [ ] **Slack bot** - Daily digest of top priorities
- [ ] **Web UI** - Visual backlog management
- [ ] **Multi-tenancy** - Separate knowledge per team/project

---

## Contributing

We welcome contributions! See areas to help:

1. **Algorithm tuning** - Better leverage scoring heuristics
2. **New filters** - More task categorization options
3. **Integrations** - Connect to Jira, Linear, Notion, etc.
4. **Documentation** - More examples and use cases
5. **Testing** - Unit tests for scoring logic

**To contribute:**
1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) file

---

## Credits

Built with:
- **[Model Context Protocol (MCP)](https://modelcontextprotocol.io/)** by Anthropic
- **Node.js** for server runtime
- **JSONL** for simple, scalable storage

Inspired by institutional memory challenges in fast-moving dev teams.

---

## FAQ

**Q: Does this work with tools other than Claude?**  
A: Yes! Any MCP-compatible AI tool can use it. Currently supported: Claude Desktop, Cursor, Warp, and any custom MCP client.

**Q: Can I use this for multiple projects?**  
A: Absolutely. Use the `repo` parameter to separate knowledge by project/service.

**Q: How do I avoid IP leakage in logs?**  
A: Never log API keys, secrets, or sensitive data in `context` or `lesson` fields. Use abstractions: "API key from env var" not "sk_live_abc123".

**Q: What if I want different KPI weights per project?**  
A: Add metadata to memories: `metadata: { project_kpis: { velocity: 3.0 }}`. Then filter in queries.

**Q: Can I migrate from other knowledge tools?**  
A: Yes! Write a script to convert your data to JSONL format. We have examples for Notion, Confluence, Obsidian.

**Q: How do I backup my memories?**  
A: The `logs/` directory is just JSONL files. Back up to S3, Git, or any file storage. Restore by copying files back.

---

**Star this repo if you believe AI agents should remember what they learn!** ⭐
