## Pull Request Checklist

### Security & Configuration
- [ ] **CSP Update Required?** If adding external scripts/media/fonts, update Content Security Policy in `next.config.js`
  - Scripts: Add domain to `script-src`
  - Media/Videos: Add domain to `media-src`
  - Fonts: Add domain to `font-src`
  - API calls: Add domain to `connect-src`
- [ ] **Middleware Impact?** Check if changes affect authentication, routing, or request handling
- [ ] **Environment Variables?** Add any new env vars to `.env.example` and deployment settings

### Code Quality
- [ ] **Tests Updated?** Add/update tests for new functionality
- [ ] **Type Safety?** Run `npm run typecheck` to verify TypeScript
- [ ] **Linting?** Run `npm run lint` to check code style
- [ ] **Build Success?** Verify `npm run build` completes without errors

### Deployment
- [ ] **Database Changes?** Include migration scripts or schema updates
- [ ] **Third-party Services?** Document any new API keys, webhooks, or service configurations needed
- [ ] **Performance Impact?** Consider bundle size, loading times, or resource usage

## Description
<!-- Describe your changes here -->

## Testing
<!-- How did you test these changes? -->