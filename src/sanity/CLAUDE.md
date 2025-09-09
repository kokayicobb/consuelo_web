# Consuelo Sanity Studio - Claude Code Guide

This guide helps teammates use Claude Code with our Sanity Studio setup for efficient content creation and management.

## 🚀 Quick Start

### Prerequisites
- Claude Code installed and configured
- Access to the Consuelo project repository
- Sanity CLI installed: `npm install -g @sanity/cli`

### Essential Commands
```bash
# Start Sanity Studio locally
npm run dev

# Access studio at: http://localhost:3000/studio

# Sanity CLI commands
sanity start          # Start studio in development
sanity build          # Build studio for production
sanity deploy         # Deploy studio to Sanity hosting
sanity dataset list    # List available datasets
sanity documents query '*[_type == "feature"]' # Query documents
```

## 📁 Project Structure

```
src/sanity/
├── schemaTypes/           # Content schemas
│   ├── featureType.ts     # Main features schema
│   ├── postType.ts        # Blog posts
│   ├── authorType.ts      # Authors
│   └── versionHistoryType.ts # Version tracking
├── lib/
│   ├── workflowActions.ts # Custom workflow buttons
│   ├── previewComponents.tsx # Preview components
│   └── versionHistory.ts  # Version tracking logic
├── structure.ts           # Studio navigation structure
└── env.ts                # Environment configuration
```

## 🎯 Content Types & Workflows

### Features (Main Content Type)

**Workflow States:**
- 📝 **Draft** → 👀 **In Review** → ✅ **Approved** → 🚀 **Published**

**Content Sections:**
- **Core Features (1-5)**: Main product features
- **Stories (6-11)**: Feature stories and use cases  
- **Other Features (12+)**: Additional features

**Key Fields:**
- `title` - Feature name
- `description` - Brief description
- `slug` - URL slug (auto-generated from title)
- `audioFile` - Audio file for text-to-speech
- `order` - Display order (determines section)
- `workflowStatus` - Current workflow state
- `content` - Rich content for feature detail pages

## 🤖 Using Claude Code

### Creating Features

Tell Claude Code:
```
Create a new feature about [topic] with order [number]. Make it workflow status draft.
```

### Bulk Content Creation

```
Create 5 features for our AI platform:
1. Voice Recognition (order 1)  
2. Natural Language Processing (order 2)
3. Predictive Analytics (order 3)
4. Smart Automation (order 4)
5. Real-time Insights (order 5)

Set all as draft status.
```

### Managing Workflow

```
Move all draft features to review status and assign reviewer [name]
```

```
Publish all approved features that are ready
```

### Content Updates

```
Update feature [slug] to add new content section about [topic]
```

```
Add audio files to all features that don't have them
```

## 📊 Studio Navigation

### Feature Sections
- **Core Features (1-5)** - Primary product features
- **Stories (6-11)** - Feature narratives and use cases
- **Other Features (12+)** - Extended functionality
- **📝 Draft Features** - Work in progress
- **👀 In Review** - Pending approval
- **🚀 Published Features** - Live content

### Workflow Management
- **Version History** - Track all changes
- **Review Queue** - Content awaiting review
- **Publishing Dashboard** - Ready-to-publish content

## 🔧 Common Tasks with Claude Code

### 1. Content Creation
```
# Create a complete feature
Create a feature called "Smart Analytics" with:
- Order: 3 
- Description: "Advanced analytics powered by AI"
- Rich content with 3 sections: Overview, Benefits, Implementation
- Add appropriate gradients and placeholder content
- Set workflow status to draft
```

### 2. Workflow Management
```
# Review and approve content
Show me all features in review status, then approve the ones about AI and analytics
```

### 3. Content Auditing
```
# Check content completeness  
List all features missing audio files or descriptions
```

### 4. Bulk Operations
```
# Update multiple items
Update all core features (1-5) to include a "Getting Started" section
```

## 🎨 Preview Features

The studio includes multiple preview modes:

### 1. **Enhanced List View**
- Shows workflow status badges
- Displays feature type (Core, Story, Other)
- Order numbers and recent changes

### 2. **Web Preview Tab** 
- See exactly how features appear on the website
- Real-time updates as you edit
- Desktop layout preview

### 3. **Mobile Preview Tab**
- iPhone-style mobile preview
- Responsive layout testing
- Touch-friendly interface preview

## 📝 Best Practices

### Content Creation
1. **Start with Draft**: Always begin new features in draft status
2. **Use Order Numbers**: Assign proper order (1-5 = Core, 6-11 = Stories, 12+ = Other)
3. **Add Audio Early**: Include audio files for text-to-speech functionality
4. **Rich Content**: Use the rich content editor for detailed feature pages

### Workflow Management
1. **Review Process**: Move to review when content is complete
2. **Assign Reviewers**: Always assign a specific reviewer
3. **Use Review Notes**: Provide clear feedback in review notes
4. **Track Changes**: Version history automatically tracks all changes

### Collaboration
1. **Check Review Queue**: Regularly check "👀 In Review" section
2. **Use Workflow Actions**: Click workflow buttons instead of manually changing status
3. **Preview Before Publishing**: Always preview content before publishing
4. **Document Changes**: Use meaningful commit messages

## 🚨 Troubleshooting

### Common Issues

**Studio won't start:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Can't see new schema changes:**
```bash
# Restart the studio
npm run dev
```

**Workflow actions not appearing:**
```bash
# Check document status and refresh browser
# Ensure you're on a feature document
```

### Getting Help

**Ask Claude Code:**
```
I'm having trouble with [specific issue] in Sanity Studio. Can you help debug this?
```

**Useful Queries:**
```bash
# Check recent changes
sanity documents query '*[_type == "feature"] | order(_updatedAt desc)[0..10]'

# Find features by status  
sanity documents query '*[_type == "feature" && workflowStatus == "draft"]'

# Count features by section
sanity documents query 'count(*[_type == "feature" && order >= 1 && order <= 5])'
```

## 🔄 Integration with Development

### Environment Setup
- **Development**: `npm run dev` (local studio)
- **Production**: Studio deployed at your-project.sanity.studio

### API Access
- Use Sanity client in your Next.js app
- GraphQL endpoint available
- Real-time subscriptions supported

### Deployment
```bash
# Deploy studio changes
sanity build
sanity deploy

# Deploy with specific dataset
sanity deploy --dataset production
```

---

## 📞 Support

**For Sanity Issues:**
- Sanity Documentation: https://sanity.io/docs
- Community: https://slack.sanity.io

**For Claude Code Issues:**
- Use `/help` in Claude Code
- Report issues: https://github.com/anthropics/claude-code/issues

**For Project-Specific Issues:**
- Check this guide first
- Ask in team chat
- Create GitHub issue in project repo

---

*Last updated: [Current Date]*
*Maintained by: Consuelo Development Team*