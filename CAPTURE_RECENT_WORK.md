# Capture Recent Work to Institutional Memory

## Single Command for Agents

Give this to an agent after completing a large body of work:

```
Review recent commits in this repository and capture all institutional knowledge to swarm memory. For each commit, identify: 1) UX intent (what user experience was being created), 2) completion status (what was finished), 3) unique patterns (what's special about this codebase), 4) meta patterns (company direction, KPIs), 5) any learnings. Start from HEAD on current branch and work backwards through commits. Save each finding using $AGENT_SWARM_PATH/scripts/save_memories with proper context (trigger condition), lesson (full UX journey), confidence score, and tags. Log your progress as memories so you know where you left off.
```

## Detailed Instructions for Agent

### What to Capture

**1. Intent of Each Commit**
- Read commit title and message
- Identify the UX intent (what user experience was being created/fixed)
- Match timestamp to completion date
- Save with `--type "intent"`

**2. Completed Features/Fixes**
- Identify what was finished in each commit
- Extract completion status from commit or code
- Save with `--type "success"`

**3. Codebase Patterns**
- What's unique about this codebase that you wouldn't guess at first glance?
- Architectural decisions, holonic patterns, naming conventions
- Save with `--type "pattern"`

**4. Meta Patterns**
- Company direction, strategic focus
- KPIs being optimized (speed, memory, UX, conversion, etc.)
- Include KPIs in tags section
- Save with `--type "pattern"` or `--type "intent"`

**5. Learnings**
- Anything you learned about how the code works
- Misunderstandings you resolved
- Technical discoveries
- Save with `--type "intent"` or `--type "error"`

**6. In-Progress Work**
- New routes being formed
- Partially complete projects
- What's next based on code trajectory
- Save with `--type "pattern"`

**7. Your Progress**
- Log which commits you've reviewed
- Where you stopped
- Save with `--type "success"` so you can resume

### How to Execute

**Example for gptcoach2 repo:**

```bash
cd /Users/jedi/react_projects/ix/gptcoach2

# Set environment if not already set
export AGENT_SWARM_PATH="/Users/jedi/react_projects/ix/agent-swarm-mcp"

# Start reviewing commits from today backwards
git log --oneline --since="30 days ago" -50 | while read commit_hash commit_msg; do
  # For each commit, capture what you learn
  git show $commit_hash --stat
  
  # Then save memories about it
  $AGENT_SWARM_PATH/scripts/save_memories \
    --repo "gptcoach2" \
    --type "intent" \
    --context "When analyzing commit $commit_hash: $commit_msg" \
    --lesson "Full UX journey of what this commit accomplished..." \
    --tags "commit-analysis,git-history,ux-intent,kpi-name" \
    --confidence 9
done
```

### Memory Format Requirements

**Context** = The trigger condition
- "When user tries to access dark mode settings"
- "When analyzing commit abc123: Added session persistence"
- "When deploying gen3 design system"

**Lesson** = Full UX journey with technical precision
- User actions → system behavior → technical cause → cascading effects
- Include file names, function names, specific conditions
- NO abstraction - maintain full technical detail in human terms

**Tags** = Searchable keywords
- Feature area: "auth", "ui", "api", "payments"
- Technology: "react", "node", "postgres", "stripe"
- KPIs: "conversion", "speed", "memory", "ux", "retention"
- Meta: "architecture", "gen3", "holonic"

**Confidence** = 1-10 scale
- 10 = You ran the code and verified it works
- 9 = You read code, traced flow, confirmed logic
- 8 = Multiple observations, high confidence
- 7-1 = Decreasing confidence, inference only

### Repository-Specific Instructions

**For gptcoach2 (Frontend):**
```bash
cd /Users/jedi/react_projects/ix/gptcoach2
git log --oneline g3 -50  # Start from g3 branch
# Capture: UI patterns, Gen3 design system usage, React patterns, theme system
# KPIs: UX quality, load speed, mobile responsiveness
```

**For ixcoach-api (Backend):**
```bash
cd /Users/jedi/react_projects/ix/ixcoach-api
git log --oneline master -50
# Capture: API patterns, auth flow, session management, database patterns
# KPIs: API response time, error rates, data consistency
```

### Progress Logging

Log your progress so you can resume:

```bash
$AGENT_SWARM_PATH/scripts/save_memories \
  --repo "gptcoach2-analysis" \
  --type "success" \
  --context "When performing institutional knowledge capture" \
  --lesson "Completed analysis of gptcoach2 commits from 2025-10-01 to 2025-10-30. Reviewed 47 commits on g3 branch. Captured 23 intent memories, 15 pattern memories, 9 completion memories. Next: analyze ixcoach-api starting from HEAD on master branch." \
  --tags "progress,git-analysis,checkpoint" \
  --confidence 10
```

### Quality Checklist

Before saving each memory, verify:
- [ ] Context is a trigger condition (starts with "When")
- [ ] Lesson includes full UX journey with file names
- [ ] Confidence score reflects verification level
- [ ] Tags include relevant KPIs and searchable keywords
- [ ] No abstraction - full technical precision maintained

### Example Memory

**Good:**
```bash
$AGENT_SWARM_PATH/scripts/save_memories \
  --repo "gptcoach2" \
  --type "intent" \
  --context "When user refreshes page after selecting dark mode" \
  --lesson "In commit a3b4c5d, added theme persistence so when user refreshes browser after selecting dark mode in /settings, they still see dark theme instead of flashing to light theme first. This works because App.js componentDidMount now reads user_preferences.theme from database via getUserPreferences() API call before first render, and initializes ThemeContext with saved value. Previously it defaulted to light theme then switched after API response came back, causing flash. KPI impact: reduces visual jank, improves perceived performance." \
  --tags "ui,theme,persistence,ux-quality,performance,gen3" \
  --confidence 9
```

**Bad:**
```bash
$AGENT_SWARM_PATH/scripts/save_memories \
  --repo "gptcoach2" \
  --type "intent" \
  --context "Theme persistence" \
  --lesson "Fixed theme flashing issue" \
  --confidence 10
```

## When Complete

After capturing all memories from a repository:

1. Save final progress checkpoint
2. Verify memories are queryable:
   ```bash
   jq -c 'select(.repo == "gptcoach2")' $AGENT_SWARM_PATH/logs/*.jsonl | wc -l
   ```
3. Test retrieval:
   ```bash
   jq -c 'select(.tags[] | test("gen3"))' $AGENT_SWARM_PATH/logs/*.jsonl | head -5
   ```
4. Move to next repository

## Resume After Interruption

If interrupted, query your progress:

```bash
jq -c 'select(.repo == "gptcoach2-analysis" and .type == "success")' \
  $AGENT_SWARM_PATH/logs/*.jsonl | \
  jq -r '.lesson' | tail -1
```

This shows where you left off.
