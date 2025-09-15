# Linear GraphQL API Integration

## Overview
This document outlines how to integrate Linear's GraphQL API with Claude Code and automation systems to create a seamless GTM execution workflow.

---

## API Authentication & Setup

### Personal API Key Setup
```javascript
// Environment configuration
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_ENDPOINT = 'https://api.linear.app/graphql';

// GraphQL client setup
const { GraphQLClient } = require('graphql-request');
const linearClient = new GraphQLClient(LINEAR_ENDPOINT, {
  headers: {
    Authorization: LINEAR_API_KEY,
  },
});
```

### OAuth Setup (For Team Access)
```javascript
const oauth2 = {
  client_id: process.env.LINEAR_CLIENT_ID,
  client_secret: process.env.LINEAR_CLIENT_SECRET,
  redirect_uri: 'https://consuelo-web.com/auth/linear/callback',
  scope: 'read write'
};
```

---

## Core GraphQL Queries & Mutations

### Team & User Management

#### Get Team Information
```graphql
query GetTeams {
  teams {
    nodes {
      id
      name
      key
      members {
        nodes {
          id
          name
          email
        }
      }
    }
  }
}
```

#### Get User Assignments
```graphql
query GetUserIssues($userId: String!) {
  user(id: $userId) {
    id
    name
    assignedIssues(first: 50) {
      nodes {
        id
        title
        state {
          name
        }
        priority
        labels {
          nodes {
            name
          }
        }
      }
    }
  }
}
```

### Issue Management

#### Create New Issue
```graphql
mutation CreateIssue($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue {
      id
      identifier
      title
      url
    }
  }
}
```

#### Update Issue Status
```graphql
mutation UpdateIssueStatus($id: String!, $stateId: String!) {
  issueUpdate(id: $id, input: { stateId: $stateId }) {
    success
    issue {
      id
      state {
        name
      }
    }
  }
}
```

#### Add Comment to Issue
```graphql
mutation AddComment($issueId: String!, $body: String!) {
  commentCreate(input: { issueId: $issueId, body: $body }) {
    success
    comment {
      id
      createdAt
    }
  }
}
```

---

## Automation Scripts

### Weekly Task Generation
```javascript
const createWeeklyTasks = async () => {
  const teamId = await getGrowthTeamId();
  const ryanId = await getUserId('ryan@consuelo-web.com');
  const juanId = await getUserId('juan@consuelo-web.com');

  const weeklyTasks = [
    {
      title: 'Create 2 blog posts for insurance industry',
      description: 'Focus on agent training and onboarding topics. Use Claude Code for initial drafts.',
      teamId: teamId,
      assigneeId: ryanId,
      labelIds: await getLabelIds(['content', 'P2']),
      priority: 2
    },
    {
      title: 'Outbound campaign to 100 insurance agencies',
      description: 'Research and reach out to agencies with 20+ agents. Use Claude Code for personalized sequences.',
      teamId: teamId,
      assigneeId: juanId,
      labelIds: await getLabelIds(['outbound', 'P1']),
      priority: 1
    }
  ];

  for (const task of weeklyTasks) {
    await linearClient.request(CREATE_ISSUE_MUTATION, { input: task });
  }
};

// Schedule weekly task creation
const cron = require('node-cron');
cron.schedule('0 9 * * 1', createWeeklyTasks); // Every Monday at 9 AM
```

### Demo Booking Automation
```javascript
const handleDemoBooking = async (prospectData) => {
  const kokayiId = await getUserId('kokayi@consuelo-web.com');
  const teamId = await getGrowthTeamId();

  // Determine assignee based on deal size
  const assigneeId = prospectData.estimatedValue > 1000 ? kokayiId : juanId;

  const demoTask = {
    title: `Demo preparation for ${prospectData.companyName}`,
    description: `
**Company**: ${prospectData.companyName}
**Contact**: ${prospectData.contactName} (${prospectData.email})
**Estimated Value**: $${prospectData.estimatedValue}/month
**Demo Date**: ${prospectData.demoDate}

**Preparation Tasks**:
- [ ] Research company background
- [ ] Customize demo script for insurance industry
- [ ] Prepare ROI calculations
- [ ] Set up demo environment
    `,
    teamId: teamId,
    assigneeId: assigneeId,
    labelIds: await getLabelIds(['demo', 'P1']),
    priority: 1,
    dueDate: new Date(prospectData.demoDate)
  };

  const result = await linearClient.request(CREATE_ISSUE_MUTATION, { input: demoTask });

  // Auto-generate demo materials using Claude Code
  await triggerClaudeCodeGeneration(result.issue.id, 'demo-materials');
};
```

### Content Performance Tracking
```javascript
const trackContentPerformance = async (contentId, metrics) => {
  const contentIssueId = await findIssueByCustomId(contentId);

  const performanceComment = `
## Content Performance Update
- **Views**: ${metrics.views}
- **Engagement Rate**: ${metrics.engagementRate}%
- **Leads Generated**: ${metrics.leads}
- **Social Shares**: ${metrics.shares}

${metrics.leads > 10 ? '🎉 Exceeded lead generation goal!' : '📈 Monitor and optimize'}
  `;

  await linearClient.request(ADD_COMMENT_MUTATION, {
    issueId: contentIssueId,
    body: performanceComment
  });

  // Create follow-up tasks based on performance
  if (metrics.engagementRate < 2) {
    await createFollowUpTask(contentIssueId, 'Optimize low-performing content');
  }
};
```

---

## Webhook Integration

### Linear Webhook Handler
```javascript
const express = require('express');
const app = express();

app.post('/linear-webhook', express.json(), async (req, res) => {
  const { type, action, data } = req.body;

  switch (type) {
    case 'Issue':
      await handleIssueEvent(action, data);
      break;
    case 'Comment':
      await handleCommentEvent(action, data);
      break;
    default:
      console.log(`Unhandled event type: ${type}`);
  }

  res.status(200).json({ received: true });
});

const handleIssueEvent = async (action, issueData) => {
  switch (action) {
    case 'create':
      await onIssueCreated(issueData);
      break;
    case 'update':
      await onIssueUpdated(issueData);
      break;
  }
};

const onIssueCreated = async (issue) => {
  // Auto-create GitHub branch for content tasks
  if (issue.labels.some(label => label.name === 'content')) {
    await createGitHubBranch(issue.identifier);
  }

  // Generate Claude Code prompts based on task type
  await generateClaudePrompts(issue);

  // Notify relevant team members
  await sendSlackNotification(issue);
};
```

### Claude Code Integration Triggers
```javascript
const generateClaudePrompts = async (issue) => {
  const promptTemplates = {
    content: `Create a blog post about "${issue.title}".
              Target audience: Insurance sales teams
              Tone: Professional but approachable
              Length: 1500-2000 words
              Include: SEO keywords, actionable tips, call-to-action`,

    outbound: `Generate a LinkedIn outreach sequence for "${issue.title}".
               Target: ${getTargetFromDescription(issue.description)}
               Messages: 3 follow-ups over 2 weeks
               Personalization: Company size, recent news, pain points`,

    partnership: `Create a partnership proposal for "${issue.title}".
                  Include: Value proposition, revenue sharing, implementation timeline
                  Format: Professional business proposal
                  Focus: Mutual benefit and clear next steps`
  };

  const taskType = getTaskType(issue.labels);
  const prompt = promptTemplates[taskType];

  if (prompt) {
    await createClaudeCodeSession(issue.id, prompt);
  }
};
```

---

## Reporting & Analytics

### Team Performance Dashboard
```javascript
const generateTeamReport = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const query = `
    query TeamPerformance($teamId: String!, $since: DateTime!) {
      team(id: $teamId) {
        issues(
          filter: {
            updatedAt: { gt: $since }
          }
          first: 100
        ) {
          nodes {
            id
            title
            state { name }
            assignee { name }
            createdAt
            completedAt
            priority
            labels { nodes { name } }
          }
        }
      }
    }
  `;

  const result = await linearClient.request(query, {
    teamId: await getGrowthTeamId(),
    since: thirtyDaysAgo.toISOString()
  });

  return analyzeTeamPerformance(result.team.issues.nodes);
};

const analyzeTeamPerformance = (issues) => {
  return {
    totalIssues: issues.length,
    completedIssues: issues.filter(i => i.state.name === 'Done').length,
    averageCompletionTime: calculateAverageCompletionTime(issues),
    issuesByAssignee: groupBy(issues, 'assignee.name'),
    issuesByPriority: groupBy(issues, 'priority'),
    issuesByLabel: groupLabelAnalysis(issues)
  };
};
```

### GTM Velocity Tracking
```javascript
const trackGTMVelocity = async () => {
  const metrics = {
    contentVelocity: await getContentMetrics(),
    outboundVelocity: await getOutboundMetrics(),
    partnershipVelocity: await getPartnershipMetrics()
  };

  // Create weekly velocity report
  const velocityReport = `
# Weekly GTM Velocity Report

## Content Team (Ryan)
- **Posts Published**: ${metrics.contentVelocity.published}
- **Average Time to Publish**: ${metrics.contentVelocity.avgTime} days
- **Engagement Rate**: ${metrics.contentVelocity.engagement}%

## Outbound Team (Juan)
- **Prospects Contacted**: ${metrics.outboundVelocity.contacted}
- **Demos Booked**: ${metrics.outboundVelocity.demosBooked}
- **Response Rate**: ${metrics.outboundVelocity.responseRate}%

## Partnership Team (Juan)
- **New Partnerships**: ${metrics.partnershipVelocity.newPartnerships}
- **Active Negotiations**: ${metrics.partnershipVelocity.activeNegotiations}
- **Revenue Pipeline**: $${metrics.partnershipVelocity.revenuePipeline}
  `;

  // Post report to team Slack and Linear
  await postToSlack(velocityReport);
  await createWeeklyReportIssue(velocityReport);
};
```

---

## Advanced Automation Features

### Smart Task Prioritization
```javascript
const smartPrioritization = async () => {
  const openIssues = await getOpenIssues();

  for (const issue of openIssues) {
    const priority = calculateSmartPriority(issue);

    if (priority !== issue.priority) {
      await updateIssuePriority(issue.id, priority);
      await addComment(issue.id, `Priority automatically updated to P${priority} based on: deadline proximity, business impact, and resource availability.`);
    }
  }
};

const calculateSmartPriority = (issue) => {
  let score = 0;

  // Deadline proximity (50% weight)
  if (issue.dueDate) {
    const daysUntilDue = getDaysUntilDue(issue.dueDate);
    if (daysUntilDue <= 1) score += 50;
    else if (daysUntilDue <= 3) score += 35;
    else if (daysUntilDue <= 7) score += 20;
  }

  // Business impact (30% weight)
  if (issue.labels.includes('revenue-impact')) score += 30;
  if (issue.labels.includes('customer-facing')) score += 20;

  // Resource availability (20% weight)
  const assigneeWorkload = getAssigneeWorkload(issue.assignee.id);
  if (assigneeWorkload < 0.7) score += 20;
  else if (assigneeWorkload < 0.9) score += 10;

  // Convert score to priority
  if (score >= 80) return 0; // P0 - Urgent
  if (score >= 60) return 1; // P1 - High
  if (score >= 30) return 2; // P2 - Medium
  return 3; // P3 - Low
};
```

### Automated Follow-up Generation
```javascript
const generateFollowUps = async (completedIssueId) => {
  const issue = await getIssue(completedIssueId);

  const followUpTasks = {
    content: [
      'Track content performance metrics',
      'Promote across social media channels',
      'Repurpose for other formats (video, infographic)'
    ],
    outbound: [
      'Analyze response rates and optimize sequence',
      'Follow up with engaged but non-responsive prospects',
      'Update CRM with campaign results'
    ],
    partnership: [
      'Schedule onboarding call with new partner',
      'Create co-marketing materials',
      'Set up revenue tracking and reporting'
    ]
  };

  const taskType = getTaskType(issue.labels);
  const followUps = followUpTasks[taskType] || [];

  for (const followUp of followUps) {
    await createFollowUpTask(issue.id, followUp);
  }
};
```

---

## Implementation Roadmap

### Phase 1: Basic Integration (Week 1-2)
- [ ] Set up Linear API authentication
- [ ] Implement basic CRUD operations
- [ ] Create webhook endpoints
- [ ] Test issue creation and updates

### Phase 2: Automation Scripts (Week 3-4)
- [ ] Weekly task generation
- [ ] Demo booking automation
- [ ] Content performance tracking
- [ ] Basic reporting dashboards

### Phase 3: Advanced Features (Week 5-6)
- [ ] Smart prioritization algorithm
- [ ] Claude Code integration triggers
- [ ] Advanced analytics and reporting
- [ ] Team performance optimization

### Phase 4: Optimization (Week 7-8)
- [ ] Performance monitoring and optimization
- [ ] Error handling and reliability improvements
- [ ] User feedback integration
- [ ] Documentation and training materials

## API Rate Limits & Best Practices

### Rate Limit Management
- Linear API: 1000 requests per hour per API key
- Implement exponential backoff for retries
- Cache frequently accessed data (team IDs, user IDs)
- Batch operations when possible

### Error Handling
```javascript
const makeLinearRequest = async (query, variables, retries = 3) => {
  try {
    return await linearClient.request(query, variables);
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      // Rate limited, wait and retry
      await sleep(Math.pow(2, 4 - retries) * 1000);
      return makeLinearRequest(query, variables, retries - 1);
    }
    throw error;
  }
};
```

This comprehensive integration will transform Linear from a simple project management tool into the central nervous system of your GTM operation, with Claude Code providing the AI-powered execution engine.