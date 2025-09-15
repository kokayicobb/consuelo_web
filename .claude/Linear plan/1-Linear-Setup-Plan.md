# Linear Setup Plan for Consuelo Web

## Team Structure

### Teams in Linear
1. **Growth Team** (Primary GTM execution)
   - Kokayi (CEO) - Strategy & direction
   - Ryan - SEO, content strategy, business development
   - Juan - Partnership outreach, relationship management

2. **Development Team** (Product & integrations)
   - Existing dev team members
   - Focus on platform integrations, API development

### Workspace Configuration

#### Labels System (Optimized for Views & Filtering)

**Work Type** (What kind of work):
- `content` - Blog posts, articles, newsletters
- `social` - Social media content and management
- `outbound` - Cold outreach, prospecting, demos
- `partnership` - Reseller, integration partnerships
- `product` - Feature development, integrations
- `strategy` - Planning, analysis, decision-making
- `operations` - Internal processes, tools, admin

**Platform/Channel** (Where it goes):
- `linkedin` - LinkedIn-specific content/campaigns
- `reddit` - Reddit posts and community engagement
- `instagram` - Instagram content and stories
- `youtube` - Video content and channel management
- `email` - Email campaigns and newsletters
- `website` - Blog, landing pages, SEO
- `crm` - CRM management and data work

**Timeline** (When it's needed):
- `this-week` - Due this week
- `this-month` - Due this month
- `q1-goal` - Contributes to Q1 objectives
- `ongoing` - Recurring/maintenance work

**Business Impact** (Priority level):
- `revenue-critical` - Directly impacts sales/revenue
- `brand-building` - Long-term brand/awareness
- `operational` - Keeps business running
- `experimental` - Testing new approaches

**Team Member** (Who owns it):
- `ryan-lead` - Ryan is primary owner
- `juan-lead` - Juan is primary owner
- `kokayi-lead` - Kokayi is primary owner
- `team-collab` - Requires multiple people

#### Useful Views You Can Create

**Ryan's Daily Dashboard**:
- Filter: `ryan-lead` + `this-week` + Status: "Ready" or "In Progress"
- Shows: Ryan's current work that needs attention this week

**Social Media Content Pipeline**:
- Filter: `social` + (`linkedin` OR `reddit` OR `instagram` OR `youtube`)
- Shows: All social media work across all platforms

**Revenue-Critical This Week**:
- Filter: `revenue-critical` + `this-week`
- Shows: High-impact work that directly affects sales

**Juan's Outbound + Partnership Work**:
- Filter: `juan-lead` + (`outbound` OR `partnership`)
- Shows: All of Juan's customer acquisition activities

**Content Across All Channels**:
- Filter: `content` OR `social`
- Shows: All content creation work regardless of platform

**Platform-Specific Views**:
- LinkedIn Work: Filter `linkedin`
- Reddit Strategy: Filter `reddit`
- Instagram Content: Filter `instagram`

**Weekly Planning View**:
- Filter: `this-week` + Status: "Backlog" or "Ready"
- Shows: What needs to be prioritized for current week

#### Label Combination Examples

**Example Task Labels**:
- Blog post: `content`, `website`, `this-week`, `brand-building`, `ryan-lead`
- LinkedIn outreach: `outbound`, `linkedin`, `this-week`, `revenue-critical`, `juan-lead`
- Instagram content batch: `social`, `instagram`, `this-week`, `brand-building`, `ryan-lead`
- Partnership proposal: `partnership`, `email`, `this-month`, `revenue-critical`, `juan-lead`

#### Workflow States (Standardized across all teams)
1. **Backlog** - New tasks, not yet prioritized
2. **Ready** - Prioritized and ready to start
3. **In Progress** - Currently being worked on
4. **Review** - Completed work awaiting approval
5. **Done** - Approved and deployed/published
6. **Archived** - Historical reference

#### Projects Structure

**Main Initiative**:
- **Q1 2025 GTM Launch** - The big picture goal

**Weekly Execution Projects** (These are your recurring workstreams):
1. **Weekly Content Production**
   - 2 blog posts per week
   - Daily social media content
   - Email newsletter weekly
   - Video content creation

2. **Weekly Outbound Campaign**
   - 100 new prospects researched
   - 5 outreach sequences sent
   - 20 demos booked
   - Follow-up sequences managed

3. **Monthly Partnership Development**
   - 5 new partner conversations
   - 2 partnership proposals sent
   - Reseller program maintenance
   - Integration partner discussions

**One-Time Setup Projects** (These get completed and archived):
- GoHighLevel Integration Setup
- HubSpot Integration Setup
- Salesforce Integration Setup
- Initial Reseller Program Launch
- Demo Booking System Setup

**How it works**:
- Weekly projects NEVER end - they just have new tasks added each week
- One-time projects have clear completion criteria and get archived
- Main initiative tracks overall progress toward revenue goals

## Issue Templates

### Content Creation Template
```
**Objective**: [What we want to achieve]
**Target Audience**: [Who this is for]
**Distribution Channel**: [Where this will be published]
**Success Metrics**: [How we measure success]
**Claude Code Usage**: [How AI will assist]
**Deadline**: [When this is needed]
```

### Outbound Campaign Template
```
**Campaign Goal**: [Specific objective]
**Target List**: [Who we're reaching out to]
**Message Type**: [Email, call, LinkedIn, etc.]
**Personalization Strategy**: [How to customize]
**Follow-up Sequence**: [Next steps]
**Success Metrics**: [Response rate, meetings booked]
```

### Partnership Development Template
```
**Partner Type**: [Reseller, integration, referral]
**Contact Information**: [Key decision makers]
**Value Proposition**: [What we offer them]
**Deal Structure**: [Revenue sharing, kickbacks]
**Next Actions**: [Specific follow-up tasks]
```

## Linear API Integration Points

### Automated Task Creation
- Weekly content calendar generation
- Prospect list updates from CRM
- Partnership opportunity alerts
- Integration milestone tracking

### Reporting Dashboards
- GTM velocity metrics
- Team workload distribution
- Campaign performance tracking
- Pipeline progression visibility

### Claude Code Triggers
- Auto-create content brief when new content task created
- Generate outreach templates when prospect added
- Create partnership proposals when new partner identified
- Generate integration documentation when tech task completed