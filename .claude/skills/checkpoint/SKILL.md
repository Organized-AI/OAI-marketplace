---
name: checkpoint
description: Review and summarize the most recent checkpoint markdown files to understand project status, completed work, and next steps. This skill should be used when developers want to quickly understand the current state of a project or resume work after a break.
---

# Checkpoint Skill

Checkpoint reviewer that helps developers quickly understand the current state of a project by analyzing checkpoint markdown files.

## When to Use This Skill

Use this skill when:
- Starting a new work session to understand what was completed
- Reviewing project progress and status
- Identifying next steps or pending tasks
- Understanding recent changes or decisions

## How to Use This Skill

When activated, the skill will:
1. Find the most recent `CHECKPOINT-*.md` file in the project root or DOCUMENTATION directory
2. Parse and summarize the checkpoint contents
3. Present a concise overview of project status with actionable next steps

## How to Find Checkpoints

Search for checkpoint files using these patterns:
- `CHECKPOINT-*.md` in project root
- `CHECKPOINT-*.md` in DOCUMENTATION/ directory
- Files named with date patterns like `CHECKPOINT-2025-10-29.md`

Use the most recent file based on the date in the filename or file modification time.

## What to Extract

From the checkpoint file, identify and summarize:

### 1. Session Summary (top section)
- What was the main focus of the session?
- What major features were added?

### 2. Completed Work (✅ sections)
- List 3-5 key accomplishments
- Note any new files created
- Highlight important integrations

### 3. Current State
- What's working right now?
- What's the server/deployment status?
- What components are ready to use?

### 4. Remaining Work (🎯 or ❌ sections)
- What needs to be done next?
- Are there any TODO items or pending integrations?
- What's blocking progress?

### 5. Quick Start Information
- Commands to run the project
- Key files to review
- Testing checklist items

## Output Format

Present your findings in this structure:

```markdown
# 📊 Checkpoint Review: [Date]

## Session Focus
[One sentence summary]

## ✅ What's Complete
- [Key accomplishment 1]
- [Key accomplishment 2]
- [Key accomplishment 3]

## 🚀 Current Status
- **Working**: [What's functional]
- **Server**: [URL and status if applicable]
- **Components**: [Count and types]

## 🎯 Next Actions (Priority Order)
1. **[Task 1]** - [Brief description]
2. **[Task 2]** - [Brief description]
3. **[Task 3]** - [Brief description]

## 💡 Key Insights
- [Important architectural decision or pattern]
- [Performance consideration]
- [Design choice rationale]

## 🚀 Quick Start
```bash
[Commands to run the project]
```

## 📁 Files to Review
- `[file1]` - [What to look for]
- `[file2]` - [What to modify]
```

## Usage Examples

**User asks**: "What's the current state of the project?"
**You respond**: [Provide checkpoint review as formatted above]

**User asks**: "What should I work on next?"
**You respond**: [Extract and explain the Next Actions section with context]

**User asks**: "How do I run this project?"
**You respond**: [Extract Quick Start commands and explain each step]

## Important Notes

- If multiple checkpoint files exist, always use the most recent one
- If sections are missing from the checkpoint, note that information is unavailable
- If no checkpoint file is found, inform the user and suggest creating one
- Keep your summary concise but informative (aim for 200-300 words for overview)
- Always highlight any blockers or critical issues

## Example Invocation

When user types `/checkpoint` or "review checkpoint":
1. Search for checkpoint files
2. Read the most recent one
3. Parse all sections
4. Present the formatted summary
5. Ask if the user wants details on any specific section

## Additional Capabilities

The skill can also:
- Compare two checkpoints to show progress over time
- Extract specific sections (e.g., "show me just the remaining work")
- Create a new checkpoint template based on the most recent format
- Highlight differences between what was planned vs what was completed
