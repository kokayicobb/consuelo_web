# Task Assignment & Workflow Processes

## Workflow Overview

### Linear Workflow States
```
Backlog → Ready → In Progress → Review → Done → Archived
```

**Backlog**: New tasks, not yet prioritized or assigned
**Ready**: Prioritized tasks with clear requirements, ready to start
**In Progress**: Currently being worked on by assigned team member
**Review**: Completed work awaiting approval from reviewer
**Done**: Approved and deployed/published
**Archived**: Historical reference, removed from active tracking

---

## Task Creation & Assignment Process

### Automated Task Creation

#### Weekly Recurring Tasks (Auto-generated via Linear API)
```javascript
const weeklyTasks = [
  {
    title: "Weekly blog post creation",
    assignee: "Ryan",
    labels: ["content", "P2"],
    team: "Growth"
  },
  {
    title: "Outbound prospect research (100 contacts)",
    assignee: "Juan",
    labels: ["outbound", "P1"],
    team: "Growth"
  },
  {
    title: "Partnership pipeline review",
    assignee: "Juan",
    labels: ["partnership", "P2"],
    team: "Growth"
  },
  {
    title: "Weekly GTM metrics review",
    assignee: "Kokayi",
    labels: ["strategy", "P1"],
    team: "Growth"
  }
];
```

#### Event-Triggered Task Creation
- **New demo booked** → Auto-create "Prepare demo materials for [Company]" (Assigned: Kokayi)
- **Content published** → Auto-create "Promote content across channels" (Assigned: Ryan)
- **Partnership inquiry** → Auto-create "Qualify partnership opportunity" (Assigned: Juan)
- **Customer feedback received** → Auto-create "Analyze and respond to feedback" (Assigned: Juan)

### Manual Task Creation Guidelines

#### Task Title Format
- **Content**: "Create [Type] about [Topic] for [Channel]"
- **Outbound**: "Outreach campaign to [Target] for [Objective]"
- **Partnership**: "[Action] partnership with [Company] for [Goal]"
- **Strategy**: "Analyze [Subject] for [Decision/Outcome]"

#### Required Task Information
1. **Clear Objective**: What exactly needs to be accomplished
2. **Success Criteria**: How do we know it's done correctly
3. **Priority Level**: P0 (Urgent), P1 (High), P2 (Medium), P3 (Low)
4. **Estimated Time**: Hours or days expected to complete
5. **Dependencies**: Other tasks that must be completed first
6. **Claude Code Usage**: How AI will assist with this task

---

## Assignment Rules & Logic

### Auto-Assignment Rules

#### Content Tasks
- **Blog posts, SEO content** → Ryan
- **Social media content** → Ryan
- **Email campaigns** → Ryan (creation), Juan (review for customer insights)
- **Video scripts** → Ryan (creation), Kokayi (review)

#### Outbound Tasks
- **Prospect research** → Juan
- **Email/LinkedIn sequences** → Juan
- **Demo booking** → Juan
- **Demo delivery** → Juan (SMB), Kokayi (Enterprise >$1K monthly value)

#### Partnership Tasks
- **Reseller recruitment** → Juan
- **Integration partnerships** → Juan (initiation), Kokayi (negotiation)
- **Partnership agreements** → Kokayi (review/approval)
- **Co-marketing** → Ryan (creation), Juan (partnership coordination)

#### Strategic Tasks
- **Market analysis** → Kokayi (with Ryan support)
- **Product decisions** → Kokayi
- **Hiring decisions** → Kokayi
- **Financial planning** → Kokayi

### Priority-Based Assignment

#### P0 - Urgent (Same day completion required)
- Customer escalations
- Website/product downtime
- Major partnership negotiations
- Press/media inquiries
- **Auto-assigned**: Kokayi (with team support)

#### P1 - High (2-3 day completion)
- Demo preparations
- Content publishing deadlines
- Qualified prospect follow-ups
- Partnership proposal deadlines
- **Assignment**: Based on expertise area

#### P2 - Medium (1 week completion)
- Regular content creation
- Prospect research
- Partnership pipeline building
- Performance analysis
- **Assignment**: Balanced across team workload

#### P3 - Low (2+ weeks, flexible)
- Process improvements
- Tool evaluation
- Long-term market research
- Nice-to-have content
- **Assignment**: Based on availability and interest

---

## Workflow Stage Management

### Ready → In Progress Transition
**Requirements**:
- Task has clear acceptance criteria
- Assignee has necessary resources/access
- Dependencies are resolved
- Estimated time is documented

**Actions**:
- Assignee moves task to "In Progress"
- Adds comment with start time and approach
- Creates GitHub branch if code/content creation involved
- Starts Claude Code session if applicable

### In Progress → Review Transition
**Requirements**:
- Work is completed according to acceptance criteria
- All deliverables are uploaded/linked
- Claude Code outputs are refined and ready
- Time spent is logged

**Actions**:
- Assignee moves to "Review" and assigns reviewer
- Adds completion comment with deliverables
- Tags appropriate reviewer (@ryan, @juan, @kokayi)
- Includes Claude Code usage summary

### Review → Done Transition
**Requirements**:
- Reviewer approves quality and completeness
- Any requested changes are implemented
- Final deliverable is published/deployed
- Success metrics are defined for tracking

**Actions**:
- Reviewer moves to "Done"
- Adds approval comment
- Archives related materials in appropriate folder
- Creates follow-up tasks if needed

### Done → Archived Transition
**Requirements**:
- 30 days have passed since completion
- No follow-up actions are needed
- Performance results are documented
- Lessons learned are captured

**Actions**:
- System auto-archives after 30 days
- Manual archive for immediate cleanup
- Results added to team knowledge base

---

## Workload Balancing

### Capacity Management

#### Individual Weekly Capacity Targets
- **Ryan**: 25 hours productive work (content creation, SEO, marketing)
- **Juan**: 30 hours productive work (outbound, partnerships, customer success)
- **Kokayi**: 20 hours productive work (strategy, demos, partnerships)

#### Task Point System
- **P0 tasks**: 8 points (urgent, high complexity)
- **P1 tasks**: 5 points (important, medium complexity)
- **P2 tasks**: 3 points (standard, routine work)
- **P3 tasks**: 1 point (low priority, simple)

#### Weekly Point Allocation
- **Ryan**: Target 15-20 points per week
- **Juan**: Target 18-25 points per week
- **Kokayi**: Target 12-18 points per week

### Overflow Management

#### When Team Member is Over-Capacity
1. **Reassign P3 tasks** to other team members
2. **Push P2 tasks** to following week
3. **Escalate P1 tasks** to Kokayi for prioritization
4. **Never delay P0 tasks** - add team support instead

#### When Team Member is Under-Capacity
1. **Pull forward P2 tasks** from backlog
2. **Take on cross-functional support** tasks
3. **Focus on process improvements** and documentation
4. **Invest in learning/development** activities

---

## Quality Assurance Workflow

### Content Quality Checklist
- [ ] Brand voice and tone consistency
- [ ] Grammar and spelling accuracy
- [ ] SEO optimization (keywords, meta descriptions)
- [ ] Call-to-action clarity
- [ ] Legal/compliance review (if applicable)
- [ ] Performance tracking setup

### Outbound Quality Checklist
- [ ] Personalization accuracy
- [ ] CAN-SPAM compliance
- [ ] Value proposition clarity
- [ ] Follow-up sequence logic
- [ ] Tracking links functional
- [ ] A/B test variants prepared

### Partnership Quality Checklist
- [ ] Legal terms accuracy
- [ ] Revenue/commission calculations
- [ ] Implementation timeline realism
- [ ] Success metrics defined
- [ ] Communication plan established
- [ ] Stakeholder approval obtained

---

## Performance Tracking

### Individual Performance Metrics

#### Task Completion Metrics
- **Velocity**: Points completed per week
- **Quality**: % of tasks passing review on first attempt
- **Timeliness**: % of tasks completed by deadline
- **Initiative**: % of self-created vs. assigned tasks

#### Team Performance Metrics
- **Throughput**: Total points completed per week
- **Cycle Time**: Average time from Ready → Done
- **Blocked Time**: Average time tasks spend blocked
- **Collaboration**: Cross-team task completion rate

### Weekly Performance Review Process

#### Monday Planning Session
1. Review previous week's completion rates
2. Identify bottlenecks and blockers
3. Adjust capacity allocation for current week
4. Set weekly goals for each team member

#### Friday Retrospective
1. Analyze completed vs. planned work
2. Discuss quality issues and improvements
3. Celebrate wins and successful collaborations
4. Plan process improvements for following week

### Monthly Performance Analysis
- Individual OKR progress tracking
- Team velocity trend analysis
- Process efficiency improvements
- Tool and workflow optimization opportunities

---

## Emergency Escalation Procedures

### P0 Issue Response Protocol
1. **Immediate notification** via Slack @channel
2. **All-hands response** within 15 minutes
3. **Status updates** every 30 minutes until resolved
4. **Post-mortem** within 24 hours of resolution

### Customer Issue Escalation
1. **Juan handles** initial response (within 2 hours)
2. **Escalate to Kokayi** if revenue >$500/month at risk
3. **Create improvement tasks** to prevent recurrence
4. **Update knowledge base** with solution

### Partnership Emergency Protocol
1. **Juan assesses** partnership risk level
2. **Kokayi engaged** for partnerships >$10K annual value
3. **Legal consultation** if contract disputes arise
4. **Damage control** and relationship repair plan executed