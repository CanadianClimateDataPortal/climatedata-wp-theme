# Ladle Utilities

**Development-only utilities** for enhancing component development workflow with Ladle.

## Purpose

Since Ladle doesn't support addons like Storybook, these TypeScript modules provide equivalent functionality for story files. They allow you to:

- Mock application context (i18n, locale providers)
- Simulate loading states and Suspense boundaries
- Test components in isolation with realistic behavior

## Usage

Import utilities in your `*.stories.tsx` files:

```typescript
import { ladleLazy, LadleMockLocaleProvider } from '@/lib/ladle';
```

## Available Utilities

- **`ladleLazy`**: Artificial lazy loading for demonstrating Suspense boundaries without dynamic imports
- **`LadleMockLocaleProvider`**: Mock i18n and locale context for testing translated components

## Build Exclusion

These utilities are **excluded from production builds**. Story files (`*.stories.tsx`) and Ladle-specific code are development-only and will not be bundled in the production application.
