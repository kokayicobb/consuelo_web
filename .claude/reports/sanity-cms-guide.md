# Consuelo Web - Modern Sanity CMS Guide

## 📋 Quick Navigation
1. [Overview & Access](#overview--access)
2. [Modern Design Features](#modern-design-features)
3. [Content Management](#content-management)
4. [Adding Images & Rich Content](#adding-images--rich-content)
5. [Styling & Layout](#styling--layout)
6. [Advanced Features](#advanced-features)
7. [Development Workflow](#development-workflow)

## Overview & Access

Your website uses **Sanity CMS** with a modern, minimalist design inspired by contemporary blog aesthetics. The system supports both homepage features and individual feature detail pages with rich content and image support.

### Quick Access
- **Website**: `http://localhost:3001` (dev) / `https://consuelohq.com` (prod)
- **Sanity Studio**: `http://localhost:3001/studio` (dev) / `https://consuelohq.com/studio` (prod)

## Modern Design Features

### ✨ New Design Elements
- **Light Typography**: Clean, modern font weights with generous spacing
- **Minimal Color Palette**: Dark/gray gradient hero sections with clean white content areas
- **Enhanced Image Support**: Full-width images with rounded corners and shadows
- **Better Content Flow**: Improved typography hierarchy and spacing
- **Professional Layouts**: Inspired by modern blog designs like OpenAI's articles

### 🎨 Visual Improvements
- **Hero Sections**: Dark gradient backgrounds with subtle texture patterns
- **Typography**: Light font weights (font-light) for headings, relaxed line-height
- **Spacing**: Generous padding (py-32) and proper content spacing
- **Images**: Full-bleed images with captions and proper aspect ratios
- **Cards**: Minimalist design with subtle borders and hover effects

## Content Management

### 🏠 Homepage Content

#### Features Section
1. Go to Sanity Studio → **Features**
2. Create/edit features with:
   - **Title**: Feature name
   - **Description**: Short description  
   - **Slug**: URL path (e.g., `mercury` for `/mercury`)
   - **Is Hero**: Make it the large feature card
   - **Gradient**: Colors for the card background
   - **Order**: Display order on homepage

#### Use Cases Section  
1. Go to Sanity Studio → **Use Cases**
2. Create/edit use cases with:
   - **Category**: `ecommerce` or `fitness`
   - **Title**, **Description**, **Image**
   - **Order**: Display order within category

### 📄 Feature Detail Pages

Each feature gets its own page at `/{slug}` with modern article-style layout.

## Adding Images & Rich Content

### 🖼️ New Rich Content Editor
The content editor now supports both rich text with embedded images AND markdown:

#### Rich Content (Recommended)
1. In Sanity Studio → **Features** → Select a feature
2. Use the **"Page Content"** field (not the markdown one)
3. You can now:
   - **Add images** by clicking the image icon in the toolbar
   - **Upload directly** to Sanity's CDN
   - **Add captions** to images
   - **Format text** with headings, bold, italic, links
   - **Create lists** and quotes

#### Image Best Practices
- **Upload high-quality images** (1200px+ width recommended)
- **Always add alt text** for accessibility
- **Use captions** to provide context
- **Images display full-width** with rounded corners and shadows

#### Content Structure Example:
```
## The Challenge
[Your content here...]

[INSERT IMAGE with caption: "Screenshot of the dashboard interface"]

### Key Benefits:
• **Benefit 1** - Description
• **Benefit 2** - Description

> "Quote from customer" - Customer Name, Company

[INSERT IMAGE with caption: "Results chart showing 300% improvement"]
```

### 📝 Markdown Support (Legacy)
For existing content, you can still use the **"Page Content (Markdown - Legacy)"** field:
- Supports `## headings`, `**bold**`, `- lists`
- Links: `[text](url)`
- No inline image support (use rich content above instead)

## Styling & Layout

### 🎨 Current Design System

**Color Palette:**
- **Hero Background**: Dark gradient (gray-900 to black)
- **Content Background**: Clean white/gray-950 (dark mode)
- **Text**: Gray-700/gray-300 for body, gray-900/white for headings
- **Accents**: Subtle gradients for buttons and cards

**Typography:**
- **Headings**: Font-light with tight tracking
- **Body Text**: Text-xl with relaxed leading (1.625)
- **Captions**: Text-sm with gray-500

**Layout Sections:**
1. **Hero**: Large typography, dark gradient, CTA button
2. **Content**: Article-style layout, max-width-4xl
3. **Features Grid**: 3-column grid with icons and descriptions  
4. **CTA**: Dark background with minimal button
5. **Related**: Clean cards with border hover effects

### 📱 Responsive Design
- **Mobile**: Single column, reduced padding
- **Tablet**: Improved spacing, larger text
- **Desktop**: Full layout with proper margins

## Advanced Features

### 🎬 Video Support
Add videos to your feature pages:
- **Hero Video**: Add URL in the "Hero Video" field
- **Content Videos**: Embed using rich content or HTML in markdown

### 🔧 Custom Styling
The design follows modern principles but can be customized:

**File Locations:**
- **Page Layout**: `src/app/[slug]/page.tsx`
- **Rich Text Styling**: `src/components/PortableText/index.tsx`
- **Homepage**: `src/app/page.tsx`

**Common Customizations:**
```typescript
// Change hero gradient
bg-gradient-to-br from-purple-900 to-indigo-900

// Adjust typography
text-5xl font-light tracking-tight

// Modify spacing  
py-32 (instead of py-24)
```

### 🚀 Performance Features
- **Image Optimization**: Automatic WebP conversion and sizing
- **Lazy Loading**: Images load as needed
- **CDN Delivery**: Fast global image delivery via Sanity CDN

## Development Workflow

### 👥 Team Workflow

1. **Content Team**:
   - Use Sanity Studio for all content updates
   - Add images directly through the rich content editor
   - Preview changes before publishing
   - No code deployment needed for content changes

2. **Developers**:
   - Edit React components for layout changes
   - Customize styling in component files
   - Deploy code changes to production

### 🔄 Publishing Process

1. **Edit Content** in Sanity Studio
2. **Preview** your changes (content shows as draft)
3. **Add Images** using the rich content editor
4. **Publish** when ready (changes go live)
5. **Wait ~30 seconds** for production to update

### ⚡ Quick Commands

```bash
# Development
npm run dev              # Start with hot reload

# Production
npm run build           # Build optimized version
npm start              # Run production server

# Access Sanity Studio
# Dev: http://localhost:3001/studio
# Prod: https://consuelohq.com/studio
```

### 🛠️ File Structure

```
src/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── [slug]/
│   │   └── page.tsx            # Modern feature pages  
│   └── studio/[[...tool]]/     # Sanity Studio
├── components/
│   ├── PortableText/           # Rich content renderer
│   │   └── index.tsx           # Handles images, formatting
│   ├── ui/
│   │   └── markdown-content.tsx # Legacy markdown support
│   └── Features/               # Homepage components
├── sanity/
│   ├── schemaTypes/
│   │   ├── featureType.ts      # Updated with rich content
│   │   └── useCaseType.ts      # Use case content model
│   └── lib/
│       ├── client.ts           # API client
│       └── image.ts            # Image URL generation
```

## Troubleshooting

### Images Not Showing
1. **Check CDN**: Verify `next.config.js` includes `cdn.sanity.io`
2. **Upload Method**: Use Sanity Studio upload, not external URLs  
3. **Alt Text**: Always add for accessibility
4. **Cache**: Wait 30 seconds in production

### Content Not Updating
1. **Publish Status**: Ensure content is published, not just saved
2. **Cache**: Clear browser cache or wait 30 seconds
3. **Rich vs Markdown**: Use rich content for images, markdown for simple text

### Styling Issues
1. **Dark Mode**: Check dark: prefixes are applied
2. **Responsive**: Test on different screen sizes
3. **Typography**: Verify prose classes are applied correctly

### New Content Not Appearing  
1. **Schema Changes**: Restart dev server after schema updates
2. **Query Updates**: Add new fields to GROQ queries
3. **Component Updates**: Update React components to display new fields

---

## Summary

Your Sanity CMS now features a modern, professional design with:

- **Clean Typography**: Light fonts, generous spacing
- **Rich Image Support**: Direct upload with captions  
- **Professional Layout**: Inspired by modern blog designs
- **Better Content Flow**: Improved spacing and hierarchy
- **Mobile Optimized**: Responsive design across devices

The system balances beautiful design with easy content management, allowing you to create professional-looking feature pages without touching code.

For advanced customizations or questions, refer to the specific component files and this guide.