# Quick Reference - Consuelo Web CMS

## 🚀 Essential Links
- **Website**: http://localhost:3001 (dev) / https://consuelohq.com (prod)
- **CMS Admin**: http://localhost:3001/studio (dev) / https://consuelohq.com/studio (prod)

## 📁 Key Files to Know

### Content Management (Sanity)
```
src/sanity/schemaTypes/
├── featureType.ts      # Feature pages content structure
├── useCaseType.ts      # Use cases content structure  
└── index.ts            # Exports all content types
```

### Page Templates
```
src/app/
├── page.tsx            # Homepage layout
└── [slug]/page.tsx     # Feature detail pages (/mercury, etc.)
```

### Components
```
src/components/
├── Features/index.tsx      # Homepage feature cards
├── UseCases/index.tsx      # Homepage use cases section
└── ui/markdown-content.tsx # Renders your markdown content
```

## ⚡ Quick Tasks

### Add New Feature Page
1. **Sanity Studio** → Create new Feature
2. **Set slug** (e.g., `new-feature` → creates `/new-feature` page)
3. **Add content** → Page appears automatically

### Change Feature Page Layout  
Edit: `src/app/[slug]/page.tsx` (lines 96-231)

### Add New Content Field
1. **Add to schema**: `src/sanity/schemaTypes/featureType.ts`
2. **Add to query**: Update `FEATURE_QUERY` in `src/app/[slug]/page.tsx`
3. **Use in template**: `{feature.newField}`

### Embed Loom Video
```typescript
// Add to schema
defineField({
  name: 'loomVideo',
  title: 'Loom Video URL', 
  type: 'url'
})

// Use in component
{feature.loomVideo && (
  <iframe 
    src={feature.loomVideo.replace('/share/', '/embed/')}
    className="w-full aspect-video rounded-lg"
  />
)}
```

## 🎨 Common Styling Changes

### Colors
```typescript
// Hero gradient
"bg-gradient-to-br from-purple-900 via-blue-900 to-green-900"

// Section backgrounds
"bg-gray-50"    // Light gray
"bg-white"      # White  
"bg-blue-600"   // Blue CTA section
```

### Spacing
```typescript
"py-12"     // Less padding
"py-24"     // Default padding  
"py-32"     // More padding
```

### Text Sizes
```typescript
"text-3xl"  // Medium heading
"text-4xl"  // Large heading
"text-6xl"  // Extra large heading
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build  

# Clear cache and restart
rm -rf .next && npm run dev
```

## ⚠️ Important Notes

- **Content changes** → Update instantly (no deployment needed)
- **Code changes** → Require deployment to production  
- **Production cache** → Content updates in ~30 seconds
- **Schema changes** → Restart dev server to see in Studio