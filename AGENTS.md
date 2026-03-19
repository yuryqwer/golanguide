# AGENTS.md - Agent Guidelines for Golanguide

This document provides guidelines for AI agents operating in this repository.

## Project Overview

- **Type**: Docusaurus documentation site (Chinese Go language interview guide)
- **Tech Stack**: Node.js 20+, React 19, Docusaurus 3.9.2
- **Language**: Simplified Chinese (zh-CN)
- **Styling**: CSS Modules + Infima (Docusaurus default CSS framework)
- **Package Manager**: npm

## Build & Development Commands

### Development Server
```bash
npm start                      # Start dev server with hot reload (default port 3000)
npm run start -- --port 3000   # Start on specific port
```

### Production Build
```bash
npm run build                  # Build for production
npm run serve                  # Serve production build locally (after build)
npm run clear                  # Clear Docusaurus cache (run if build fails)
```

### Deployment
```bash
npm run deploy                 # Deploy to GitHub Pages
```

### Docusaurus CLI Utilities
```bash
npm run docusaurus <command>   # Run any Docusaurus CLI command
npm run swizzle                # Eject/theme Docusaurus components
npm run write-translations      # Generate translation files
npm run write-heading-ids      # Generate heading IDs for Markdown
```

### Linting & Type Checking
- **No ESLint/Prettier configured** - This is a documentation-focused project
- For JavaScript type checking, use VSCode with `@ts-check` and JSDoc annotations
- Run `npm run build` to verify there are no errors before committing

### Testing
- **No test framework configured** - This is a documentation-only project
- Do not add testing libraries unless explicitly requested by user

## Code Style Guidelines

### General Rules
- Use ES modules (`import`/`export`) - **never use CommonJS** (`require`/`module.exports`)
- Use Docusaurus component patterns consistently
- Follow existing code in `src/` as reference
- **No comments in code** unless explicitly required
- Use Chinese (Simplified) for all user-facing text

### JavaScript/React Conventions

#### Components
- Use functional components exclusively (arrow functions or `function` keyword)
- Default exports for page components, named exports for utilities
- Always provide `key` props in list rendering

#### Hooks
- Use React hooks (`useState`, `useEffect`, etc.) where needed
- Docusaurus-specific hooks:
  - `useDocusaurusContext` - access site configuration
  - `useDoc` - access current doc metadata and TOC
  - `useColorMode` - get/set color theme
  - `useWindowSize` - responsive breakpoint detection
  - `BrowserOnly` - client-only rendering wrapper

#### State Management
- Local component state only (no Redux/Context unless necessary)
- Prefer `useState` over `useEffect` for derived state when possible

### Import Order (strict)
1. React core imports (`react`)
2. Third-party library imports (clsx, prism-react-renderer, @giscus/react)
3. Docusaurus imports (`@docusaurus/...`, `@theme/...`, `@theme-original/...`)
4. Local component imports (`@site/src/...`)
5. CSS/style imports (`./styles.module.css`)

Example:
```javascript
import React from 'react';
import clsx from 'clsx';
import {useWindowSize} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import DocItemPaginator from '@theme/DocItem/Paginator';
import Layout from '@theme/Layout';
import MyComponent from '@site/src/components/MyComponent';
import styles from './styles.module.css';
```

### File Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| JavaScript files | camelCase | `docItemLayout.js` |
| Component folders | PascalCase | `HomepageFeatures/` |
| Component index files | `index.js` | `HomepageFeatures/index.js` |
| CSS modules | `{name}.module.css` | `styles.module.css` |

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `HomepageHeader`, `DocItemLayout` |
| Functions/variables | camelCase | `siteConfig`, `handleClick` |
| CSS classes (built-in) | kebab-case | `hero--primary`, `button--lg` |
| CSS module classes | camelCase | `styles.heroBanner` |
| React hooks | camelCase with `use` prefix | `useDoc`, `useWindowSize` |

### CSS/Styling
- **CSS Modules**: Use for component-specific styles (`*.module.css`)
- **Infima classes**: Use Docusaurus built-in CSS classes
- **Inline styles**: Use for one-off customizations: `<div style={{marginTop: '20px'}}>`
- **Custom CSS**: Edit `src/css/custom.css` for global styles
- **CSS variables**: Use Infima variables for theming (`--ifm-color-primary`)

### Type Checking (JSDoc)
This project uses JSDoc annotations with `@ts-check`:
```javascript
/** @type {import('@docusaurus/types').Config} */
const config = {...};

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {...};
```

## Docusaurus-Specific Patterns

### Swizzling Components
For deep customization, swizzle Docusaurus components:
```javascript
// src/theme/DocItem/Layout/index.js
import OriginalLayout from '@theme/DocItem/Layout';
export default function DocItemLayout({children}) {
  // Add custom wrapper around original
  return <OriginalLayout>{children}</OriginalLayout>;
}
```

### Front Matter in Docs
```markdown
---
hide_table_of_contents: true
---
```

### Using Links
```javascript
import Link from '@docusaurus/Link';
<Link to="/docs/guide/preface">开始阅读</Link>
```

### Client-Only Components
```javascript
import BrowserOnly from '@docusaurus/BrowserOnly';

<BrowserOnly fallback={<div>Loading...</div>}>
  {() => {
    // Client-only code here
    return <ClientComponent />;
  }}
</BrowserOnly>
```

## Project Structure

```
/src
  /pages/              # Custom pages (index.js, index.module.css)
  /theme/              # Swizzled Docusaurus components
    /DocItem/Layout/   # Custom doc layout (adds comments)
  /components/         # Custom React components
    /HomepageFeatures/ # Homepage feature section
    /Comments/         # Giscus comments component
  /css/                # Global CSS (custom.css)
/docs/                 # Markdown documentation files
  /guide/              # Interview guide docs (autogenerated sidebar)
  /experience/          # Real interview experience docs
/static/               # Static assets (images, SVGs)
/docusaurus.config.js   # Docusaurus configuration
/sidebars.js            # Sidebar configuration
```

## Error Handling

- **Broken links**: `onBrokenLinks: 'throw'` is set - always fix broken links
- **Async operations**: Use try/catch blocks
- **Missing translations**: Handle gracefully (project uses `zh-CN` locale)
- **SSR issues**: Use `BrowserOnly` wrapper for client-only components
- **Build verification**: Run `npm run build` before committing

## Common Tasks

### Adding Documentation
1. Create `.md` or `.mdx` file in `docs/guide/` or `docs/experience/`
2. Add front matter: `id`, `title`, `sidebar_position` (optional)
3. Sidebars are autogenerated from directory structure

### Adding Components
1. Create folder in `src/components/` with `index.js` and `styles.module.css`
2. Import using `@site/src/components/ComponentName`

### Deploying
1. Ensure `npm run build` succeeds
2. Run `npm run deploy` to push to GitHub Pages
3. Site URL: https://golanguide.cn

## Important Notes

- This is a Chinese-language site - all user-facing text must be in Simplified Chinese
- Giscus comments are configured but disabled (see commented config in `docusaurus.config.js`)
- Prism syntax highlighting is configured for Go and other languages
- Docusaurus v4 compatibility mode is enabled (`future.v4: true`)
