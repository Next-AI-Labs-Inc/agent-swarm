# Daily Checkup - Operational Health Monitoring

## Overview

The `daily_checkup` tool is your **operational health checklist** - completely separate from task prioritization. It's for when you ask "How are things going?" and want to walk through monitoring your live systems.

## Different from Task Prioritization

| Tool | Purpose | Question |
|------|---------|----------|
| `suggest_next_task` | **What to build/fix** | "What should I work on?" |
| `daily_checkup` | **What to monitor** | "How are things going?" |

**Task prioritization** = development work (features, bugs, refactoring)  
**Daily checkup** = operational monitoring (metrics, health, customer feedback)

## Natural Language

Ask any of these:
- "How are things going?"
- "Daily checkup?"
- "Health check?"
- "Status check?"
- "Show me the monitoring checklist"

## What It Does

Walks you through prioritized operational checks:

1. **PostHog** - User errors, rage clicks, dropped sessions
2. **Email Scan** - Customer feedback, support requests (via ChatGPT)
3. **Marketing Stats** - Conversion rates, traffic, campaigns
4. **Server Health** - Error rates, response times, uptime
5. **Payment Health** - Stripe metrics, failed payments, churn
6. **GitHub Activity** - PRs, security alerts, failed builds

## Example Output

```markdown
🩺 **Daily Health Checkup**

Run through these 6 checks to stay on top of operations:

**1. Check PostHog for recorded user issues and errors**
   📋 Review PostHog recordings dashboard for any errors, rage clicks, or dropped sessions in last 24h. Look for patterns in error logs and user friction points.
   🔧 Tool: PostHog
   🔗 https://app.posthog.com/project/YOUR_PROJECT/recordings

**2. Scan email for customer communications and highlights**
   📋 Have ChatGPT review your inbox for customer feedback, support requests, or important communications.
   💬 GPT Prompt: "Review my last 24h of emails and summarize: 1) Any customer issues or feedback, 2) Support requests needing attention, 3) Important communications I should respond to, 4) Any patterns or trends in customer sentiment"
   🔧 Tool: ChatGPT

**3. Check marketing stats and campaign performance**
   📋 Review marketing dashboard for: conversion rates, traffic sources, campaign performance, bounce rates. Flag any significant changes (>20%) from baseline.
   🔧 Tool: Analytics Dashboard
   🔗 https://analytics.google.com

**4. Review server health and API performance metrics**
   📋 Check error rates, response times, uptime status. Look for: 5xx errors, slow endpoints (>2s), memory/CPU spikes, failed cron jobs.
   🔧 Tool: Server Monitoring

**5. Check payment processing and revenue health**
   📋 Review Stripe dashboard for: failed payments, subscription churn, MRR trends, dispute/refund requests.
   🔧 Tool: Stripe Dashboard
   🔗 https://dashboard.stripe.com

**6. Review GitHub notifications and PR activity**
   📋 Check for: pending PR reviews, security alerts (Dependabot), failed CI/CD builds, open issues requiring triage.
   🔧 Tool: GitHub
   🔗 https://github.com/notifications

---
✅ Check off each item as you complete it. Reply 'done' when finished.
```

## Creating Checkup Items

### Basic Template
```javascript
add_memory({
  repo: "gptcoach2",  // or shared-tools for cross-repo
  context: "Brief description of what to check",
  lesson: "Detailed instructions on what to look for",
  tags: ["daily-checkup", "category"],  // daily-checkup tag is required
  confidence: 10,  // Used for priority (higher = check first)
  metadata: {
    tool: "Tool Name",  // Optional: what tool to use
    url: "https://...",  // Optional: direct link
    gpt_prompt: "..."   // Optional: if ChatGPT should help
  }
})
```

### Example: PostHog Check
```javascript
add_memory({
  repo: "gptcoach2",
  context: "Check PostHog for recorded user issues and errors",
  lesson: "Review PostHog recordings dashboard for any errors, rage clicks, or dropped sessions in last 24h. Look for patterns in error logs and user friction points.",
  tags: ["daily-checkup", "monitoring", "user-experience"],
  confidence: 10,
  metadata: {
    tool: "PostHog",
    url: "https://app.posthog.com/project/YOUR_PROJECT/recordings"
  }
})
```

### Example: ChatGPT Email Scan
```javascript
add_memory({
  repo: "shared-tools",
  context: "Scan email for customer communications and highlights",
  lesson: "Have ChatGPT review your inbox for customer feedback, support requests, or important communications.",
  tags: ["daily-checkup", "customer-success", "communication"],
  confidence: 10,
  metadata: {
    tool: "ChatGPT",
    gpt_prompt: "Review my last 24h of emails and summarize: 1) Any customer issues or feedback, 2) Support requests needing attention, 3) Important communications I should respond to, 4) Any patterns or trends in customer sentiment"
  }
})
```

## Priority System

Items are sorted by `confidence` value (10 = highest priority):

- **10** - Critical daily checks (PostHog errors, customer emails, payment health)
- **9** - Important but less urgent (marketing stats, server health)
- **8** - Nice to have (GitHub notifications)
- **7 or below** - Optional checks

## Customizing Your Checklist

### Add Your Own Checks

**Database health:**
```javascript
add_memory({
  repo: "ixcoach-api",
  context: "Check database performance and query health",
  lesson: "Review slow query log, connection pool usage, table bloat. Look for queries >1s execution time.",
  tags: ["daily-checkup", "database", "infrastructure"],
  confidence: 9,
  metadata: {
    tool: "Database Monitoring"
  }
})
```

**Social media monitoring:**
```javascript
add_memory({
  repo: "ixcoach-landing",
  context: "Check social media mentions and engagement",
  lesson: "Review Twitter/LinkedIn for mentions, comments on recent posts, DMs requiring response. Check for brand mentions.",
  tags: ["daily-checkup", "marketing", "social"],
  confidence: 7,
  metadata: {
    tool: "Social Media Dashboard"
  }
})
```

**Security alerts:**
```javascript
add_memory({
  repo: "shared-tools",
  context: "Review security alerts and vulnerability reports",
  lesson: "Check AWS Security Hub, Dependabot alerts, SSL certificate expiry, failed login attempts. Triage any critical vulnerabilities.",
  tags: ["daily-checkup", "security", "infrastructure"],
  confidence: 10,
  metadata: {
    tool: "Security Dashboard"
  }
})
```

## Repo-Specific Checkups

Get checkup items for specific repo:
```javascript
daily_checkup({ repo: "gptcoach2" })
```

Shows only items tagged for that repo.

## Workflow

### Morning Routine
```
1. "How are things going?"
2. Run through each item in order
3. Flag any issues for later action
4. Reply "done" when complete
```

### Converting Findings to Tasks

If checkup reveals issues, add them as tasks:

```javascript
// Found during checkup: high error rate on /api/auth
add_memory({
  repo: "ixcoach-api",
  context: "Auth endpoint showing 15% error rate (normally 2%)",
  lesson: "Investigate /api/auth errors - check logs for common patterns, verify token validation, review recent deployments",
  tags: ["bug", "task", "urgent"],
  confidence: 9,
  metadata: {
    lifecycle_state: "planned",
    kpi_impact: ["churn_reduction", "user_experience"],
    complexity: "medium",
    estimated_loc: 100,
    file_count: 3
  }
})
```

Then run `suggest_next_task()` to prioritize it.

## Tags

Required tag for checkup items:
- `daily-checkup` (or `health-check` or `monitoring`)

Recommended category tags:
- `monitoring` - System health, errors, performance
- `customer-success` - Support, feedback, communications
- `marketing` - Analytics, campaigns, traffic
- `infrastructure` - Servers, databases, deployments
- `revenue` - Payments, subscriptions, billing
- `security` - Alerts, vulnerabilities, access
- `development` - PRs, builds, deployments

## Different Moods

**Productive mood** → "What should I work on?" → `suggest_next_task`  
**Checking-in mood** → "How are things going?" → `daily_checkup`

Both use the same memory system, different tags and purposes.

## Integration

### Morning Standup
```
User: "How are things going?"
Agent: [shows daily_checkup]
User: [works through list]
User: "Found some issues, what should I work on?"
Agent: [shows suggest_next_task]
```

### Weekly Review
```javascript
// Add weekly-only checks with lower confidence
add_memory({
  repo: "shared-tools",
  context: "Review weekly KPI dashboard",
  lesson: "Check MRR growth, user acquisition, churn rate, NPS score. Compare to last week and quarterly goals.",
  tags: ["health-check", "kpi", "weekly"],
  confidence: 5,  // Lower priority for daily checkup
  metadata: {
    frequency: "weekly"
  }
})
```

Lower confidence = appears at bottom of daily list, but still visible for weekly deep-dives.

## Best Practices

### ✅ DO:
- Keep checks actionable ("Look for X") not vague ("Check things")
- Include direct URLs when possible
- Use GPT prompts for time-consuming scans (email, logs)
- Set confidence based on importance (10 = must check daily)
- Add context about what "normal" looks like ("Flag >20% changes")

### ❌ DON'T:
- Mix development tasks with monitoring checks
- Make checks too time-consuming (aim for 2-3 min each)
- Forget to update URLs when tools change
- Leave broken/outdated checks in the list
- Skip the checkup when things "seem fine" (that's when issues hide)

## Maintenance

Update checkup items as your stack evolves:

```javascript
// Tool changed? Update the memory
update_memory({
  repo: "gptcoach2",
  search_text: "PostHog",
  updates: {
    metadata: { 
      url: "https://new-posthog-url.com",
      tool: "PostHog v2"
    }
  }
})

// Check no longer relevant? Remove it
remove_memory({
  repo: "ixcoach-landing",
  search_text: "old analytics tool"
})
```

## Summary

`daily_checkup` is your **operational health checklist** - use it daily to monitor what's running, catch issues early, and stay on top of customer/business health.

**Key Command:** "How are things going?"

Completely separate from task prioritization - this is about **monitoring**, not **building**.
