# Social Media Automation Workflow
## Claude Code + Upload-Post API Integration

## The Vision

**Linear Task**: "Create social media campaign for new insurance agent onboarding feature"

**Claude Code Session**:
```bash
claude code
> Create a social media campaign about insurance agent onboarding
> Platforms: LinkedIn, X (Twitter), Facebook
> Include: 3 posts, different angles per platform
> Auto-publish when ready
```

**I generate and immediately post**:
- LinkedIn: Professional post with industry insights
- X (Twitter): Quick tip thread
- Facebook: Customer success story
- **All published instantly via API**

---

## Technical Setup

### Upload-Post API Integration
```javascript
// In your VS Code project
const UploadPost = require('upload-post');

const client = new UploadPost({
  apiKey: process.env.UPLOAD_POST_API_KEY
});

// Function I can call from Claude Code
const publishSocialContent = async (content) => {
  // LinkedIn Post
  await client.uploadText({
    user: "ryan_consuelo",
    platform: ["linkedin"],
    title: content.linkedin.text,
    description: content.linkedin.description
  });

  // X (Twitter) Post
  await client.uploadText({
    user: "ryan_consuelo",
    platform: ["x"],
    title: content.twitter.text
  });

  // Facebook Post
  await client.uploadText({
    user: "ryan_consuelo",
    platform: ["facebook"],
    title: content.facebook.text,
    facebook_page_id: "your_page_id"
  });
};
```

### Claude Code Integration Commands

I could create a simple command structure:

```bash
# Generate and publish social content
claude-social "Create post about [topic]" --platforms="linkedin,twitter,facebook" --publish=true

# Generate content for review first
claude-social "Create post about [topic]" --platforms="linkedin,twitter" --draft=true

# Create video script and upload video
claude-video "Create video script about [topic]" --video-file="demo.mp4" --platforms="tiktok,instagram,youtube"
```

---

## Real Workflow Examples

### Ryan's Content Creation + Auto-Publish

**Linear Task**: "Weekly social media content - insurance industry trends"

**Claude Code Session**:
```
ryan@computer:~$ claude code
> Create this week's social media content about insurance industry trends
> Platforms: LinkedIn, X, Facebook
> Auto-publish immediately
> Include industry statistics and actionable tips
```

**I respond with + immediately post**:
1. **LinkedIn** (Professional): "5 Insurance Industry Trends Every Agency Should Watch in 2025 [detailed analysis with stats]"
2. **X (Twitter)** (Quick tips): "🧵 Quick thread: 3 ways insurance agents can adapt to AI trends: 1/5 [thread format]"
3. **Facebook** (Community): "Insurance agency owners - what trends are you seeing? Share in comments [engagement post]"

**Result**: Ryan gets 3 platform-optimized posts published instantly, saves 2+ hours

### Juan's Outbound Campaign + Social Proof

**Linear Task**: "Social media campaign supporting outbound to insurance agencies"

**Claude Code Session**:
```
juan@computer:~$ claude code
> Create social proof campaign for insurance agencies
> Include: customer testimonial post, feature highlight, industry insight
> Platforms: LinkedIn, X
> Support our outbound campaign messaging
> Auto-publish
```

**I create and publish**:
1. **LinkedIn**: Customer case study with metrics
2. **X**: Feature highlight with demo GIF
3. **Both**: Reinforce the messaging Juan uses in cold outreach

### Video Content Integration

**The video challenge**: Upload-Post API supports video uploads to TikTok, Instagram, YouTube, etc.

**Workflow**:
1. You create video file (screen recording, talking head, etc.)
2. Save in VS Code project folder
3. Claude Code session:
   ```
   > Create video script and upload the video
   > Video file: /path/to/demo_video.mp4
   > Platforms: TikTok, Instagram, YouTube
   > Topic: Insurance agent training demo
   ```
4. I generate:
   - Platform-optimized descriptions
   - Hashtags for each platform
   - Upload video with API
   - Create supporting social posts

---

## API Cost Analysis

### Upload-Post Pricing (estimated)
- **Text Posts**: ~$0.10 per post per platform
- **Photo Posts**: ~$0.15 per post per platform
- **Video Posts**: ~$0.25 per post per platform

### Monthly Cost Estimate
- 60 text posts/month (3 platforms × 20 posts) = $18
- 20 photo posts/month = $9
- 8 video posts/month = $16
- **Total**: ~$43/month for automated posting

**ROI**: Ryan saves 15+ hours/month on social media management = $43 vs. $1,500 in time cost

---

## Implementation Phases

### Phase 1: Basic Text Automation (Week 1)
- Set up Upload-Post API account
- Connect LinkedIn, X, Facebook
- Test basic text posting from Claude Code
- Create simple command structure

### Phase 2: Content Strategy Integration (Week 2)
- Link Linear tasks to auto-posting
- Create content templates for different campaign types
- Set up approval workflows (draft vs. immediate publish)

### Phase 3: Photo/Video Integration (Week 3-4)
- Add photo posting capabilities
- Test video upload workflows
- Create VS Code project structure for media files
- Optimize for TikTok, Instagram, YouTube

### Phase 4: Advanced Features (Month 2)
- Scheduling capabilities
- A/B testing different post versions
- Performance tracking integration
- Cross-platform content optimization

---

## VS Code Project Structure

```
consuelo_social_automation/
├── package.json
├── .env (API keys)
├── src/
│   ├── claude-social.js (main posting functions)
│   ├── content-templates/
│   └── upload-handlers/
├── media/
│   ├── videos/
│   ├── images/
│   └── templates/
├── content/
│   ├── published/
│   └── drafts/
└── scripts/
    ├── test-posting.js
    └── bulk-upload.js
```

### Sample Implementation

```javascript
// claude-social.js
const UploadPost = require('upload-post');

class ClaudeSocialAutomation {
  constructor() {
    this.client = new UploadPost({
      apiKey: process.env.UPLOAD_POST_API_KEY
    });
  }

  async publishContent(content, options = {}) {
    const results = [];

    for (const platform of options.platforms || ['linkedin', 'x']) {
      try {
        const result = await this.client.uploadText({
          user: options.user || 'consuelo_web',
          platform: [platform],
          title: content[platform] || content.default,
          ...this.getPlatformSpecificOptions(platform, content)
        });

        results.push({ platform, success: true, result });
      } catch (error) {
        results.push({ platform, success: false, error: error.message });
      }
    }

    return results;
  }

  async publishVideo(videoPath, content, platforms) {
    // Handle video uploads with platform-specific optimizations
    const results = [];

    for (const platform of platforms) {
      const result = await this.client.uploadVideo({
        user: 'consuelo_web',
        platform: [platform],
        video: videoPath,
        title: content[platform]?.title || content.default.title,
        description: content[platform]?.description || content.default.description,
        ...this.getPlatformVideoOptions(platform)
      });

      results.push({ platform, result });
    }

    return results;
  }
}
```

---

## Benefits of This Approach

### Immediate Productivity Gains
- **Ryan**: 15 hours/week saved on social media management
- **Juan**: Social proof automatically supports outbound campaigns
- **Kokayi**: Professional content published without time investment

### Quality + Scale
- Platform-optimized content for each channel
- Consistent posting frequency
- Professional quality maintained through Claude Code
- Immediate publishing removes scheduling friction

### Integration Benefits
- Linear tasks automatically generate social content
- Outbound campaigns supported by social proof
- Content calendar executed automatically
- Performance tracking built-in

### Cost Efficiency
- $43/month for automation vs. $1,500/month in team time
- Professional quality without hiring social media manager
- Scales infinitely without additional time investment

This transforms social media from a time-consuming task into an automated extension of your GTM strategy. Every Linear task could automatically generate supporting social content, published instantly across all platforms.