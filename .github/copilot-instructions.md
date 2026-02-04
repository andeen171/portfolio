# Copilot Instructions for Portfolio Project

## Project Overview

This is a multilingual portfolio website built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Sanity CMS**. The project features internationalization (i18n) support for English (en-US) and Portuguese (pt-BR), custom UI components with animations, and a headless CMS backend for managing content.

## Technology Stack

### Core Framework
- **Next.js 16** (App Router with React Server Components)
- **React 19.2.3**
- **TypeScript 5.9.3** (strict mode enabled)
- **Node.js** (ES2017 target)

### Styling & UI
- **Tailwind CSS 4.1.18** with PostCSS
- **Catppuccin** color palette and theme
- **Framer Motion** (motion) for animations
- **clsx** and **tailwind-merge** for conditional class names
- **styled-components** for CSS-in-JS when needed

### Content Management
- **Sanity CMS** (v5.3.0)
- **next-sanity** for Next.js integration
- **@sanity/image-url** for image optimization
- **@portabletext/react** for rich text rendering
- **sanity-plugin-internationalized-array** for multilingual content

### Internationalization
- **next-intl** (v4.7.0) for i18n
- Supported locales: `en-US` (default), `pt-BR`
- Locale prefix strategy: `as-needed`

### State Management & Utilities
- **Zustand** (v5.0.10) for global state
- **Zod** (v4.3.5) for schema validation and environment variables
- **SuperJSON** (v2.2.6) for data serialization
- **dotenv** for environment configuration

### Development Tools
- **Biome** for linting and formatting (replaces ESLint/Prettier)
- **Turbopack** for fast development builds
- **Yarn 4.9.2** as package manager

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (localized)/              # Localized routes group
│   │   └── [locale]/             # Dynamic locale segment
│   │       ├── layout.tsx        # Localized layout
│   │       ├── page.tsx          # Homepage
│   │       ├── experiences/      # Experiences page
│   │       ├── projects/         # Projects page
│   │       └── skills/           # Skills page
│   └── studio/                   # Sanity Studio
│       └── [[...tool]]/          # Catch-all route for Studio
├── components/                   # React components
│   ├── about/                    # About section components
│   ├── experiences/              # Experience-related components
│   ├── projects/                 # Project-related components
│   ├── skills/                   # Skill-related components
│   ├── SVG/                      # SVG icon components
│   └── timeline/                 # Timeline UI components
├── contexts/                     # React contexts
├── i18n/                         # Internationalization config
│   ├── request.ts                # i18n request handler
│   └── routing.ts                # Locale routing config
├── lib/                          # Utility libraries
├── sanity/                       # Sanity CMS configuration
│   ├── lib/                      # Sanity helper functions
│   ├── schemaTypes/              # Sanity schema definitions
│   ├── queries.ts                # GROQ queries
│   ├── structure.ts              # Studio structure
│   └── types.ts                  # Generated types
├── styles/                       # Global styles
├── types/                        # TypeScript type definitions
└── utils/                        # Utility functions
```

## Coding Standards & Conventions

### TypeScript
- **Strict mode enabled**: All code must be type-safe
- **No unchecked indexed access**: Always check array/object access
- Use **explicit types** for function parameters and returns
- Prefer **interfaces** for object shapes, **types** for unions/intersections
- Use **Zod** for runtime validation and environment variables
- Import types with `import type { ... }` when possible

### React & Next.js
- Use **React Server Components (RSC)** by default
- Add `'use client'` directive only when necessary (hooks, browser APIs, interactivity)
- Prefer **async Server Components** for data fetching
- Use **metadata** API for SEO (not Head component)
- Follow **App Router** conventions for routing
- Use **route groups** `(groupName)` for organization without affecting URLs

### File Naming
- **Components**: PascalCase (e.g., `HeroSection.tsx`, `SkillItem.tsx`)
- **Utilities/Libs**: camelCase (e.g., `utils.ts`, `client.ts`)
- **Pages/Layouts**: lowercase (e.g., `page.tsx`, `layout.tsx`)
- **Config files**: kebab-case or as required by tools

### Component Structure
```tsx
// 1. Imports (grouped: external, internal, types)
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { ComponentProps } from '@/types';

// 2. Types/Interfaces
interface Props {
  title: string;
  children: ReactNode;
}

// 3. Component
export function Component({ title, children }: Props) {
  // 4. Hooks
  const t = useTranslations();
  
  // 5. Logic
  
  // 6. Return JSX
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

### Styling
- Use **Tailwind CSS** utility classes as primary styling method
- Use **@catppuccin/tailwindcss** for theme colors
- Combine classes with `cn()` utility from `@/lib/utils`
- Custom animations defined in `tailwind.config.mjs`
- Avoid inline styles unless necessary for dynamic values
- Use **styled-components** sparingly for complex component styling

### Internationalization (i18n)
- All user-facing text must be internationalized
- Translation keys in `messages/en-US.json` and `messages/pt-BR.json`
- Use `useTranslations()` hook in Client Components
- Use `getTranslations()` in Server Components
- Access locale with `useLocale()` or from params
- Use i18n-aware navigation from `@/i18n/routing`

```tsx
// Client Component
'use client';
import { useTranslations } from 'next-intl';

export function ClientComponent() {
  const t = useTranslations('HomePage');
  return <h1>{t('title')}</h1>;
}

// Server Component
import { getTranslations } from 'next-intl/server';

export async function ServerComponent() {
  const t = await getTranslations('HomePage');
  return <h1>{t('title')}</h1>;
}
```

### Sanity CMS Integration
- Content types: `experience`, `project`, `skill`
- Use **GROQ queries** in `src/sanity/queries.ts`
- Fetch data with `client.fetch()` from `@/sanity/lib/client`
- Use `@sanity/image-url` for responsive images
- Render rich text with `@portabletext/react`
- Generate types: `yarn typegen`
- Access Studio at `/studio` route

```tsx
import { client } from '@/sanity/lib/client';
import { skillsQuery } from '@/sanity/queries';
import type { Skill } from '@/sanity/types';

export async function SkillsPage() {
  const skills = await client.fetch<Skill[]>(skillsQuery);
  return <SkillList skills={skills} />;
}
```

### State Management
- Use **Zustand** for global state (store in `src/store.ts`)
- Use **React Context** for scoped state
- Prefer **Server Components** with props over client state when possible
- Use **URL search params** for shareable state

### Environment Variables
- Define in `src/env.mjs` with Zod validation
- Prefix client vars with `NEXT_PUBLIC_`
- Required vars:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION`

## Common Patterns

### Path Aliases
- Use `@/*` for `src/*` imports
- Example: `import { cn } from '@/lib/utils'`

### Image Handling
- Use Next.js `<Image>` component from `next/image`
- Configure remote patterns in `next.config.mjs`
- Use Sanity image builder for CMS images

### Animation
- Use **Framer Motion** (`motion` package) for animations
- Custom animation presets in `tailwind.config.mjs`
- Components: `ShootingStars`, `StarsBackground`, `CatppuccinGradient`

### Forms & Validation
- Use **Zod** for schema validation
- Use **@tailwindcss/forms** for form styling
- Use **@headlessui/react** for accessible UI components

## Scripts

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Lint and auto-fix with Biome
- `yarn format` - Format code with Biome
- `yarn typegen` - Generate Sanity types

## Best Practices

### Performance
- Prefer Server Components for better performance
- Use `loading.tsx` and `error.tsx` for UX
- Optimize images with Next.js Image component
- Use dynamic imports for heavy client components
- Leverage React Suspense for streaming

### Accessibility
- Use semantic HTML elements
- Add proper ARIA labels and roles
- Ensure keyboard navigation works
- Use HeadlessUI for accessible components
- Test with screen readers

### SEO
- Use Next.js Metadata API in layouts/pages
- Add proper Open Graph tags
- Use descriptive alt text for images
- Implement structured data when relevant

### Code Quality
- Run `yarn lint` before committing
- Keep components small and focused (Single Responsibility)
- Extract repeated logic into hooks or utilities
- Write descriptive variable and function names
- Add JSDoc comments for complex functions
- Avoid deeply nested components

### Security
- Validate all environment variables
- Sanitize user input
- Use proper Content Security Policy
- Keep dependencies updated

## Common Issues & Solutions

### Type Errors
- Run `yarn typegen` to regenerate Sanity types
- Check `noUncheckedIndexedAccess` for array access
- Ensure all component props are typed

### i18n Issues
- Verify translation keys exist in both locale files
- Check locale is properly passed in params
- Use i18n-aware navigation from `@/i18n/routing`

### Build Errors
- Clear `.next` folder and rebuild
- Verify environment variables are set
- Check for client-only code in Server Components

### Styling Issues
- Check Tailwind content paths in config
- Use `cn()` utility for conditional classes
- Verify custom animations are defined in config

## Additional Notes

- **No ESLint/Prettier**: This project uses **Biome** for all linting and formatting
- **Strict TypeScript**: All code must pass strict type checking
- **Internationalized by default**: Always consider i18n when adding features
- **Content-driven**: Most dynamic content comes from Sanity CMS
- **Mobile-first**: Design responsive layouts starting from mobile
- **Theme support**: Built-in support for Catppuccin color palette
