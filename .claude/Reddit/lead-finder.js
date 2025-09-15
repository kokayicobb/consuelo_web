const https = require('https');
const http = require('http');

async function searchRedditLeads() {
  const searches = [
    {
      name: "Entrepreneur Business Needs",
      subreddits: ["Entrepreneur"],
      keywords: ["looking for", "need help", "seeking", "hiring", "consultant"],
      time_filter: "week"
    },
    {
      name: "Startup Opportunities",
      subreddits: ["startups", "smallbusiness"],
      keywords: ["need", "looking for", "help", "service", "software"],
      time_filter: "week"
    },
    {
      name: "Marketing/Sales Leads",
      subreddits: ["marketing", "sales"],
      keywords: ["agency", "freelancer", "automation", "lead generation"],
      time_filter: "week"
    }
  ];

  const results = [];

  for (const search of searches) {
    console.log(`\n🔍 Searching: ${search.name}`);

    try {
      const response = await makeRequest({
        subreddits: search.subreddits,
        keywords: search.keywords,
        sort_type: "new",
        time_filter: search.time_filter,
        per_page: 10
      });

      if (response.posts && response.posts.length > 0) {
        results.push({
          searchName: search.name,
          posts: response.posts,
          meta: response.meta
        });

        console.log(`✅ Found ${response.posts.length} posts for ${search.name}`);
      } else {
        console.log(`❌ No posts found for ${search.name}`);
      }
    } catch (error) {
      console.error(`❌ Error searching ${search.name}:`, error.message);
    }

    // Rate limiting between searches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
}

function makeRequest(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/reddit/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 120000 // 2 minutes
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${responseData.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.abort();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

// Generate report
async function generateReport() {
  console.log('🚀 Starting Reddit Lead Generation...\n');

  const results = await searchRedditLeads();

  if (results.length === 0) {
    console.log('❌ No results found across all searches');
    return;
  }

  console.log('\n📊 BUSINESS LEADS REPORT');
  console.log('='.repeat(50));

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.searchName.toUpperCase()}`);
    console.log('-'.repeat(30));

    result.posts.forEach((post, postIndex) => {
      const redditUrl = `https://reddit.com${post.permalink}`;
      console.log(`\n   ${postIndex + 1}. ${post.title}`);
      console.log(`      💬 r/${post.subreddit.name} | 👤 u/${post.author.name}`);
      console.log(`      ⭐ Score: ${post.score} | 💬 Comments: ${post.num_comments}`);
      console.log(`      🔗 ${redditUrl}`);

      if (post.text && post.text.length > 0) {
        const preview = post.text.substring(0, 150) + (post.text.length > 150 ? '...' : '');
        console.log(`      📝 "${preview}"`);
      }
    });
  });

  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total searches: ${results.length}`);
  console.log(`   Total leads found: ${results.reduce((sum, r) => sum + r.posts.length, 0)}`);
  console.log(`   Subreddits covered: ${[...new Set(results.flatMap(r => r.posts.map(p => p.subreddit.name)))].join(', ')}`);
}

// Run the lead generation
generateReport().catch(console.error);