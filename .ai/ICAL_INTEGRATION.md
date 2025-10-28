# iCal Session Scheduler Integration

## 🎯 Purpose

Pre-schedule your Claude Code development sessions with token budgets, goals, and success criteria built into your calendar. This ensures:

- **Budget awareness** - Know your token limits before you start
- **Goal clarity** - Clear objectives for each session
- **Time management** - Scheduled blocks prevent overruns
- **Continuity** - Session handoffs are smooth and documented

## 📅 Quick Start

### 1. Import Session Template

**macOS Calendar:**
```bash
open .ai/session-template.ics
```

**Google Calendar:**
1. Go to Google Calendar
2. Click "+" next to "Other calendars"
3. Select "Import"
4. Choose `.ai/session-template.ics`
5. Select your development calendar

**Outlook:**
1. File → Import → iCalendar (.ics) file
2. Select `.ai/session-template.ics`
3. Choose calendar to import to

### 2. Customize Your Sessions

Edit the template events with your:
- Project name
- Actual session times
- Specific goals
- Adjusted token budgets

### 3. Set Up Recurring Sessions

**Example Weekly Schedule:**
```
Monday 2-5pm:    Planning & Architecture (50k tokens)
Wednesday 2-5pm: Implementation (100k tokens)
Friday 1-4pm:    Testing & Polish (75k tokens)
```

## 📊 Session Types & Token Budgets

### Planning Session (50,000 tokens)
**Primary Model:** Sonnet 4.5 (40k tokens)
**Review Model:** Opus 4 (10k tokens)

**Activities:**
- Complete planning documents
- Draft architecture
- Create roadmap
- Design data models

**Cost:** ~$0.30-0.45

---

### Implementation Session (100,000 tokens)
**Primary Model:** Sonnet 4.5 (85k tokens)
**Review Model:** Opus 4 (10k tokens)
**Docs Model:** Haiku 3.5 (5k tokens)

**Activities:**
- Feature development
- API implementation
- UI component creation
- Test writing

**Cost:** ~$0.60-0.75

---

### Testing & Polish Session (75,000 tokens)
**Primary Model:** Sonnet 4.5 (60k tokens)
**Review Model:** Opus 4 (10k tokens)
**Docs Model:** Haiku 3.5 (5k tokens)

**Activities:**
- Comprehensive testing
- Bug fixes
- Performance optimization
- Documentation updates

**Cost:** ~$0.45-0.60

---

### Security Review Session (40,000 tokens)
**Primary Model:** Opus 4 (30k tokens)
**Analysis Model:** Sonnet 4.5 (10k tokens)

**Activities:**
- Security audit
- Vulnerability assessment
- Compliance validation
- Critical code review

**Cost:** ~$0.60-0.75

## 🔔 Calendar Alerts

### 15 Minutes Before Session
**Alert includes:**
- Token budget reminder
- Primary model to use
- Budget check instruction: `cat .ai/token-tracker.json`

### 30 Minutes Before End
**Alert includes:**
- Prepare session summary
- Review token usage
- Document next steps

## 📝 Session Event Template

```icalendar
SUMMARY: Claude Code: [Project] - [Session Type]

DESCRIPTION:
Project: organized-ai-marketplace
Session Type: [Planning/Implementation/Testing/Review]
Framework: [PM-Meta/BMAD METHOD/Hybrid]

TOKEN BUDGET:
Total: [X] tokens
- Opus 4: [X] tokens (critical decisions)
- Sonnet 4.5: [X] tokens (implementation)
- Haiku 3.5: [X] tokens (routine tasks)

GOALS:
1. [Primary goal]
2. [Secondary goal]
3. [Tertiary goal]

SUCCESS CRITERIA:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

DELIVERABLES:
- [File/Feature 1]
- [File/Feature 2]
- [Documentation update]

NOTES:
- [Important consideration]
- [Budget preservation strategy]
- [Any blockers or dependencies]

X-CLAUDE-TOKEN-BUDGET-TOTAL: [X]
X-CLAUDE-TOKEN-BUDGET-OPUS: [X]
X-CLAUDE-TOKEN-BUDGET-SONNET: [X]
X-CLAUDE-TOKEN-BUDGET-HAIKU: [X]
X-CLAUDE-PRIMARY-MODEL: [model-name]
```

## 🎯 Strategic Session Planning

### Week 1: Foundation (150k tokens)
```
Mon: Planning (50k) - Sonnet + Opus review
Wed: Architecture (50k) - Sonnet + Opus review
Fri: Setup (50k) - Sonnet + Haiku docs
```

### Week 2-5: Core Development (400k tokens/week)
```
Mon: Feature Planning (50k) - Sonnet
Wed: Implementation (200k) - Sonnet
Thu: Implementation (150k) - Sonnet
Fri: Testing & Review (100k) - Sonnet + Opus review
```

### Week 6: Polish & Launch (200k tokens)
```
Mon: Bug Fixes (75k) - Sonnet
Wed: Security Review (40k) - Opus + Sonnet
Thu: Performance (60k) - Sonnet
Fri: Documentation (25k) - Haiku
```

## 📈 Post-Session Workflow

### 1. Update Calendar Event
After each session, add notes:
```
ACTUAL USAGE:
- Opus: [X]k tokens ([X]% of budget)
- Sonnet: [X]k tokens ([X]% of budget)
- Haiku: [X]k tokens ([X]% of budget)
- Total: [X]k / [budgeted]k ([X]%)

COMPLETED:
✅ [Goal 1]
✅ [Goal 2]
⏳ [Goal 3 - partial]

NEXT SESSION:
- Continue [incomplete goal]
- Start [next feature]
- Review [pending item]
```

### 2. Update Token Tracker
```bash
# Log actual usage
echo "$(date): Session complete, used [X]k tokens" >> .ai/reports/sessions/manual.log

# Update budget
# Edit .ai/token-tracker.json with actual usage
```

### 3. Schedule Next Session
- Review remaining budget
- Plan next goals
- Adjust token allocation based on actual usage
- Create calendar event

## 💡 Pro Tips

### Preserve Opus Budget
```
❌ Don't use Opus for:
- Initial planning (use Sonnet)
- Routine implementation (use Sonnet)
- Documentation (use Haiku)
- Simple refactoring (use Sonnet)

✅ Do use Opus for:
- Final architecture validation
- Security reviews
- Complex algorithm design
- Critical decision points
```

### Session Time Management
- **Planning sessions:** 2-3 hours (includes thinking time)
- **Implementation sessions:** 3-4 hours (focused coding)
- **Review sessions:** 1-2 hours (quality checks)
- **Don't exceed** scheduled time - better to continue next session

### Budget Flexibility
- Reserve 10-20% buffer for unexpected complexity
- If approaching limit, switch to lighter model
- Better to split work across sessions than exceed budget

## 🔧 Advanced: Hooks Integration

For automated calendar integration (future enhancement):

```python
# Pre-session hook reads calendar event
# Sets token budget from X-CLAUDE-TOKEN-BUDGET-* fields
# Configures default model selection
# Loads session goals and context

# Post-session hook updates calendar event
# Logs actual vs budgeted usage
# Documents completed vs incomplete goals
# Suggests next session timing and budget
```

See `PLANNING/07-token-tracking-implementation.md` for full hooks implementation.

## 📚 Related Documentation

- [Token Tracker Configuration](.ai/token-tracker.json)
- [AI Assistance Guide](.ai/README.md)
- [Model Selection Strategy](../PLANNING/01-project-brief.md)
- [Implementation Roadmap](../PLANNING/05-implementation-roadmap.md)
- [Full Token Tracking Implementation](../PLANNING/07-token-tracking-implementation.md)

---

**Remember:** The calendar is your budget enforcement tool. Stick to your scheduled sessions, respect your token budgets, and you'll never run out of Opus unexpectedly again!
