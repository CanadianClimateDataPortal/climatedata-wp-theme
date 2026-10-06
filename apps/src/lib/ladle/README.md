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
- **`LadleMockLocaleProvider`**: Mock i18n and locale context for testing translated components. The global provider in `apps/.ladle/components.tsx` already supplies the Redux store and a default `LocaleProvider` to every story. That default locale is `'en'`, with no translations. Use this one only to switch the locale or to supply French strings. Such a story declares the `locale` arg (`StoryWithLocale`, `createLadleMockLocaleStoryArgTypes()`), which shows up as a Ladle control, and passes it to `LadleMockLocaleProvider`.

  A story that needs Redux state imports `store` from `@/app/store` and dispatches into it before rendering. It is the same store the global provider mounts, and its state persists across stories.

## Build Exclusion

These utilities are **excluded from production builds**. Story files (`*.stories.tsx`) and Ladle-specific code are development-only and will not be bundled in the production application.
