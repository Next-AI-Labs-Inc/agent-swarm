# Agent Swarm MCP - Complete Setup Guide

**Get institutional memory for your AI agents in 10 minutes.**

This guide walks through setup for all major AI tools: Claude Desktop, Cursor, Warp, and custom agents.

---

## Why Agent Swarm?

**The Problem:** You teach Claude how to fix an error. Next day, Cursor encounters the same error and has no idea. Next week, new team member asks the same question again.

**The Solution:** Agent Swarm MCP gives all your AI agents **shared, persistent memory** that:
- ✅ Survives across tools (Claude → Cursor → Warp)
- ✅ Survives across sessions (weeks, months, years)
- ✅ Prioritizes work by leverage (ROI-based)
- ✅ Monitors operational health automatically

Think: "What if your team's collective knowledge actually stuck around?"

---

## Quick Setup (3 Steps)

### 1. Install

```bash
git clone https://github.com/Next-AI-Labs-Inc/agent-swarm.git
cd agent-swarm/mcp-server
npm install
```

### 2. Configure Your Tools

Pick your AI tool(s) below and follow the setup.

### 3. Test It

```bash
# Ask any AI tool:
"What should I work on?"

# Or:
"How are things going?"
```

If it responds with leveraged tasks or a health checklist, **you're done!** 🎉

---

## Setup by Tool

### 🤖 Claude Desktop

**Positioning:** Claude Desktop pioneered MCP. Agent Swarm unlocks institutional memory across all your Claude conversations.

**Setup:**

1. **Locate config file:**
   ```bash
   # macOS
   ~/Library/Application Support/Claude/claude_desktop_config.json
   
   # Windows
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Add MCP server:**
   ```json
   {
     "mcpServers": {
       "agent-swarm": {
         "command": "node",
         "args": ["/FULL/PATH/TO/agent-swarm/mcp-server/index.js"]
       }
     }
   }
   ```
   
   **Replace `/FULL/PATH/TO/`** with your actual path:
   ```bash
   # Get full path:
   cd agent-swarm && pwd
   # Copy output, paste above
   ```

3. **Restart Claude Desktop**

4. **Test:**
   ```
   You: "What MCP tools are available?"
   Claude: [Should list: retrieve_memories, add_memory, suggest_next_task, daily_checkup, ...]
   ```

**Use Cases:**
- 🧠 **Knowledge Base**: "How do we handle API retries?" → retrieves pattern
- 🎯 **Sprint Planning**: "What should we build this sprint?" → prioritized by leverage
- 🩺 **Morning Standup**: "How are things going?" → daily health checklist
- 🏷️ **Quick Wins**: "Show me easy wins" → filtered by effort/impact

---

### 💻 Cursor IDE

**Positioning:** Cursor is the leading AI-first IDE. Agent Swarm makes Cursor learn from every file you touch, every error you fix.

**Setup:**

1. **Open Cursor Settings:**
   - Press `Cmd/Ctrl + ,`
   - Search "MCP"
   - Or: Cursor → Preferences → Features → MCP Servers

2. **Add MCP Server:**
   ```json
   {
     "mcpServers": {
       "agent-swarm": {
         "command": "node",
         "args": ["/FULL/PATH/TO/agent-swarm/mcp-server/index.js"]
       }
     }
   }
   ```

3. **Restart Cursor**

4. **Test in Cursor Chat:**
   ```
   You: "What are the highest leverage maintenance tasks?"
   Cursor: [Shows top 10 by leverage score]
   ```

**Use Cases:**
- 🐛 **Error Recovery**: Cursor encounters error → logs solution → never forgets
- 🔧 **Code Patterns**: "How did we implement caching last time?" → instant recall
- 📦 **Refactoring**: "What maintenance improves velocity?" → prioritized tech debt
- 🚀 **Onboarding**: New dev's Cursor inherits team's collective knowledge

---

### ⚡ Warp Terminal

**Positioning:** Warp is the AI terminal. Agent Swarm turns terminal commands into institutional knowledge.

**Setup:**

1. **Open Warp Settings:**
   - `Cmd/Ctrl + ,`
   - Or: Warp → Settings

2. **Navigate to Features → MCP Servers**

3. **Add Server:**
   ```json
   {
     "agent-swarm": {
       "command": "node",
       "args": ["/FULL/PATH/TO/agent-swarm/mcp-server/index.js"]
     }
   }
   ```

4. **Restart Warp**

5. **Test in Warp AI:**
   ```bash
   # Ask Warp AI:
   "What should I work on next?"
   
   # Or:
   "Daily checkup?"
   ```

**Use Cases:**
- 🔥 **Command History++**: Not just history, but *context* and *why*
- 🚨 **Error Patterns**: "ECONNREFUSED" → Warp suggests `brew services start postgresql`
- 📊 **DevOps Monitoring**: "How are things going?" → checks servers, logs, metrics
- ⚙️ **Deployment**: Captures deployment steps, environment quirks, rollback procedures

---

### 🛠️ Custom Agents (Codex, ChatGPT, etc.)

**Positioning:** Building your own agent? Agent Swarm provides the memory layer out of the box.

**Setup (MCP Client):**

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Connect to Agent Swarm MCP server
const transport = new StdioClientTransport({
  command: "node",
  args: ["/path/to/agent-swarm/mcp-server/index.js"]
});

const client = new Client({
  name: "my-custom-agent",
  version: "1.0.0"
}, {
  capabilities: {}
});

await client.connect(transport);

// Now call tools:
const result = await client.callTool({
  name: "suggest_next_task",
  arguments: { limit: 3 }
});

console.log(result.content[0].text);
```

**Setup (REST API - Coming Soon):**

Agent Swarm will support REST API for non-MCP tools:

```bash
# Start REST server
npm run serve:rest

# Call from any tool
curl http://localhost:3000/api/suggest_next_task?limit=3
```

**Use Cases:**
- 🤖 **ChatGPT Plugins**: Add memory to ChatGPT workflows
- 🔗 **Slack Bots**: "What should the team work on?" → leverage scores
- 📱 **Mobile Apps**: AI assistants with persistent context
- 🌐 **Web Apps**: Copilot features with institutional knowledge

---

## Leading Edge Positioning

### vs. Traditional Knowledge Bases

| Feature | Notion/Confluence | Agent Swarm |
|---------|-------------------|-------------|
| **AI-Native** | ❌ Manual search | ✅ Agents query automatically |
| **Context-Aware** | ❌ Generic docs | ✅ Learns from actual work |
| **Prioritization** | ❌ Manual sorting | ✅ Leverage scoring (ROI) |
| **Cross-Tool** | ❌ Siloed | ✅ Claude → Cursor → Warp |
| **Maintenance** | ❌ Docs rot | ✅ Self-updating from usage |

### vs. RAG Systems

| Feature | RAG (Embeddings) | Agent Swarm |
|---------|------------------|-------------|
| **Speed** | Slower (vector search) | ✅ Fast (keyword + metadata) |
| **Structured Data** | ❌ Text blobs | ✅ Rich metadata (KPIs, effort, state) |
| **Actionable** | ❌ Just retrieval | ✅ Prioritization + monitoring |
| **Cost** | $$$ (OpenAI embeddings) | ✅ Free (local JSONL) |
| **Future** | | ✅ Embeddings planned as add-on |

### vs. Task Managers

| Feature | Jira/Linear | Agent Swarm |
|---------|-------------|-------------|
| **AI Integration** | ❌ Manual entry | ✅ Agents populate automatically |
| **Leverage Scoring** | ❌ None | ✅ Impact/Effort/Friction formula |
| **Learns** | ❌ Static | ✅ Improves from actual vs estimated |
| **Dev Experience** | ❌ Context switching | ✅ In-tool (IDE, terminal, chat) |

**The Gap Agent Swarm Fills:**

Traditional tools require **humans to remember to update them**. Agent Swarm captures knowledge **as you work**, automatically, across all your AI tools.

---

## Advanced Features

### 🎯 Task Prioritization

**What:** Automatically rank work by ROI using the leverage formula.

**Setup:**
```bash
# No setup needed - works out of the box
# Customize KPI weights in mcp-server/index.js if desired
```

**Usage:**
```
"What should I work on?"
→ Top 3 tasks by leverage

"What's highest leverage?"
→ Top 5 high-confidence tasks

"What reduces churn?"
→ Tasks filtered by KPI

"Show me maintenance tasks"
→ Tech debt prioritized by ROI
```

**Algorithm:**
```
Leverage = (Impact × Confidence × (1 + Momentum)) / (Effort × Friction) × Stage
```

**Why It's Better:**
- ✅ **Objective**: Math-based, not gut feeling
- ✅ **Adaptive**: Learns from completed tasks
- ✅ **Transparent**: Shows scoring breakdown
- ✅ **Configurable**: Adjust KPI weights per sprint

---

### 🩺 Operational Health

**What:** Daily checklist of monitoring tasks (errors, metrics, customer feedback).

**Setup:**

1. **Add your checkup items:**
   ```javascript
   add_memory({
     repo: "your-project",
     context: "Check error tracking dashboard",
     lesson: "Review last 24h for: error rate spikes, new error types, affected users. Flag >20% increase from baseline.",
     tags: ["daily-checkup", "monitoring"],
     confidence: 10,
     metadata: {
       tool: "Sentry",
       url: "https://your-sentry.com"
     }
   })
   ```

2. **Run daily:**
   ```
   "How are things going?"
   ```

**Pre-Built Checks:**
- 📊 Error monitoring (Sentry, Rollbar, etc.)
- 📧 Customer feedback scan (via ChatGPT)
- 📈 Marketing metrics (Analytics, Mixpanel)
- 🖥️ Server health (Datadog, New Relic)
- 💳 Payment health (Stripe dashboard)
- 🔧 GitHub activity (PRs, security alerts)

**Why It's Better:**
- ✅ **Consistent**: Never miss a check
- ✅ **Efficient**: 5-10 min runthrough vs 30+ min manual
- ✅ **Actionable**: Direct links + GPT prompts
- ✅ **Customizable**: Add your own checks

---

### 🏷️ Smart Filtering

**Task Type Filters:**
```javascript
// Maintenance work
suggest_next_task({ task_type_filter: "maintenance" })

// Bugs only
suggest_next_task({ task_type_filter: "bug" })

// Quick wins
suggest_next_task({ task_type_filter: "quick-win" })
```

**KPI Filters:**
```javascript
// Work that reduces churn
suggest_next_task({ kpi_filter: "churn_reduction" })

// Revenue-impacting work
suggest_next_task({ kpi_filter: "revenue_impact" })

// Velocity improvements
suggest_next_task({ kpi_filter: "velocity_improvement" })
```

**Combined:**
```javascript
// High-leverage maintenance that improves velocity
suggest_next_task({
  task_type_filter: "maintenance",
  kpi_filter: "velocity_improvement",
  min_confidence: 8
})
```

---

## Sample Workflows

### Morning Routine (5 min)

```
9:00 AM - Open Claude/Cursor/Warp

You: "How are things going?"
Agent: [Shows 6-item health checklist]

9:05 AM - Run through checks
- ✅ No new errors
- ✅ Email clear
- ⚠️  2 customer issues flagged
- ✅ Metrics normal
- ✅ Payments healthy
- ✅ GitHub clean

You: "What should I work on?"
Agent: [Shows top 3 tasks, including customer issues as priority]

9:10 AM - Start work on highest leverage item
```

### Sprint Planning (30 min)

```
Monday Morning - Sprint Kickoff

PM: "What should we build this sprint?"
Agent: [Shows top 20 tasks by leverage]

PM: "Filter by conversion increase"
Agent: [Shows 8 tasks impacting conversion]

PM: "Show maintenance tasks"
Agent: [Shows 5 high-leverage tech debt items]

Team decides:
- 6 conversion features (70% of sprint)
- 2 maintenance tasks (30% of sprint)
- Balanced by leverage scores
```

### Incident Response (Real-time)

```
2:00 AM - Pager goes off

Engineer: "What's the issue?"
Agent: [Retrieves past similar incidents]
Agent: "Rate limit hit - scale back batch size from 100 to 25"

Engineer: [Applies fix]
Engineer: "Log this solution"
Agent: [Captures for next time]

Next incident:
Agent: [Suggests fix immediately]
```

### New Developer Onboarding (Day 1)

```
New Dev: "How do I run tests?"
Agent: "npm run test:watch for TDD, npm test for CI"
Agent: [Shows common test failures and fixes]

New Dev: "How do we handle API retries?"
Agent: [Retrieves exponential backoff pattern with code example]

New Dev: "What's the deployment process?"
Agent: [Walks through captured steps from team's past deployments]
```

---

## Troubleshooting

### "Tool not found" error

**Cause:** MCP server not running or config wrong

**Fix:**
```bash
# 1. Verify config path is absolute
cd agent-swarm && pwd
# Copy full path to config

# 2. Test server manually
cd mcp-server && node index.js
# Should print: "IX Agent Knowledge MCP Server running on stdio"

# 3. Restart your AI tool
```

### No memories returned

**Cause:** No memories added yet

**Fix:**
```bash
# Add your first memory
node scripts/add_memory.js \
  --repo="test" \
  --context="Test memory" \
  --lesson="This is a test" \
  --tags="test" \
  --confidence=10

# Query it
# In AI tool: "Retrieve memories about test"
```

### Leverage scores seem wrong

**Cause:** KPI weights need adjustment

**Fix:**
```javascript
// Edit mcp-server/index.js
const KPI_WEIGHTS = {
  churn_reduction: 2.0,      // Boost if churn is priority
  conversion_increase: 2.5,  // Boost if conversion is priority
  velocity_improvement: 1.5,
  // ... adjust based on current goals
};
```

---

## Next Steps

### 1. Add Initial Memories

Start with common errors and patterns:

```bash
# Error pattern
add_memory({
  repo: "api-service",
  context: "When npm install fails with EACCES",
  lesson: "Run: sudo chown -R $(whoami) ~/.npm",
  tags: ["error", "npm", "permissions"],
  confidence: 10
})

# Code pattern
add_memory({
  repo: "frontend",
  context: "When implementing API retries",
  lesson: "Use exponential backoff: wait = base * (2^attempt) + random(0, 1000ms)",
  tags: ["pattern", "api", "resilience"],
  confidence: 9
})
```

### 2. Configure Daily Checkup

Add your monitoring tasks:

```bash
# See docs/DAILY_CHECKUP.md for examples
add_memory({
  repo: "your-project",
  context: "Check error tracking",
  lesson: "Review last 24h for spikes...",
  tags: ["daily-checkup", "monitoring"],
  confidence: 10,
  metadata: {
    tool: "Sentry",
    url: "https://your-sentry.com"
  }
})
```

### 3. Customize KPI Weights

Edit `mcp-server/index.js` based on your priorities.

### 4. Train Your Team

Share this guide, run a demo session, capture team knowledge.

### 5. Integrate with CI/CD

Auto-capture deployment patterns, test patterns, build issues.

---

## Getting Help

- **Documentation**: See `/docs` folder
- **Issues**: https://github.com/Next-AI-Labs-Inc/agent-swarm/issues
- **Discussions**: https://github.com/Next-AI-Labs-Inc/agent-swarm/discussions
- **Email**: support@next-ai-labs.com

---

**You're ready!** Start asking your agents "What should I work on?" and watch institutional memory come alive. 🚀
