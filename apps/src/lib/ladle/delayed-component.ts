import {
  type ComponentType,
  createElement,
} from 'react';

type DelayedComponentState = 'pending' | 'resolved';

/**
 * Creates a component wrapper that suspends for a specified delay.
 *
 * Useful for demonstrating Suspense behavior in Ladle stories without
 * requiring actual dynamic imports or data fetching.
 *
 * @param Component - The component to wrap with artificial delay
 * @param delayMs - Milliseconds to delay before resolving (default: 2000)
 *
 * @returns A component that throws a promise on first render, then resolves
 *
 * @example
 * ```typescript
 * const DelayedMyComponent = createDelayedComponent(MyComponent, 2000);
 *
 * export const WithSuspense = () => {
 *   return createElement(
 *     Suspense,
 *     { fallback: createElement('div', null, 'Loading...') },
 *     createElement(DelayedMyComponent, { someProp: 'value' }),
 *   );
 * };
 * ```
 */
export const createDelayedComponent = <P extends object>(
  Component: ComponentType<P>,
  delayMs: number = 2000,
): ComponentType<P> => {
  let status: DelayedComponentState = 'pending';
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
