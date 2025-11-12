import {
	type ComponentType,
	createElement,
} from 'react';

type LadleLazyState = 'pending' | 'resolved';

/**
 * Ladle-specific lazy loading utility that mimics React.lazy behavior.
 *
 * This utility creates a Suspense-compatible component wrapper for Ladle
 * stories, allowing demonstration of Suspense boundaries without requiring
 * dynamic imports. The wrapped component suspends for the specified delay
 * on first render, then resolves.
 *
 * **Ladle-only utility**: Not for production use. Lives in Ladle utilities
 * directory and will not be included in production builds.
 *
 * @param Component - The component to wrap with artificial suspension
 * @param delayMs - Milliseconds to suspend before resolving (default: 2000)
 *
 * @returns A Suspense-compatible component that throws a promise initially
 *
 * @example
 * ```typescript
 * // In your Ladle story file (MyComponent.stories.tsx)
 *
 * import { Suspense } from 'react';
 * import {
 * 	type StoryDefault,
 * 	type Story,
 * } from '@ladle/react';
 *
 * import { ladleLazy } from '@/lib/ladle';
 *
 * import { MyComponent } from './MyComponent';
 *
 * export default {
 *   title: 'MyComponent',
 * } satisfies StoryDefault;
 *
 * // Normally, ladleLazy would be written as `React.lazy(() => import('./MyComponent'));`
 * const LazyMyComponent = ladleLazy(MyComponent, 2000);
 *
 * // A story illustrating how to allow loading most of the UI
 * // and gradually loading heavier components.
 * export const ExampleStory: Story = () => {
 * 	return (
 * 		<Suspense
 * 			fallback={<div>Loading component...</div>}
 * 		>
 *			<LazyMyComponent someProp="value" />
 *		</Suspense>
 *	);
 * };
 *
 * ExampleStory.storyName = 'With Suspense Boundary';
 * ```
 *
 * @see {@link https://react.dev/reference/react/lazy React.lazy documentation}
 * @see {@link https://react.dev/reference/react/Suspense React Suspense documentation}
 */
export const ladleLazy = <P extends object>(
	Component: ComponentType<P>,
	delayMs: number = 2000,
): ComponentType<P> => {
	let status: LadleLazyState = 'pending';
	let resolvedComponent: ComponentType<P>;

	const suspender = new Promise<void>((resolve) => {
		setTimeout(
			() => {
				status = 'resolved';
				resolvedComponent = Component;
				resolve();
			},
			delayMs,
		);
	});

	return (props: P) => {
		if (status === 'pending') {
			throw suspender;
		}

		return createElement(
			resolvedComponent,
			props,
		);
	};
};
