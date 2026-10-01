import 'react';

import { type GlobalProvider } from '@ladle/react';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from '@/app/store';
import { LocaleProvider } from '@/context/locale-provider';

import '@/App.css';
import '@/Global.css';

/**
 * Wraps every story in the Redux store and the locale context, as
 * `src/main-map.tsx` does for the app. A component that calls `useLocale()`
 * or `useAppSelector` throws without them, and the error blanks the story.
 * The time periods stories are one case: `useS2D()` reads the store, and
 * `TimePeriodsControlS2D` calls `useLocale()`.
 *
 * The store is the `@/app/store` singleton. A story that needs state imports
 * that same `store` and dispatches into it at module level, before rendering.
 * The state then persists across every story of the Ladle session.
 *
 * `LocaleProvider` reads the locale from `data-app-lang` on `#root`. Ladle
 * has no such attribute, so the locale is `'en'` and no translations load.
 * A story that needs French opts in with the helpers of `@/lib/ladle`. It
 * declares the `locale` arg (`StoryWithLocale`,
 * `createLadleMockLocaleStoryArgTypes()`), and wraps itself in
 * `LadleMockLocaleProvider` with its French strings. That provider overrides
 * the locale for the story subtree only.
 */
export const Provider: GlobalProvider = ({
	children,
}) => {
	return (
		<ReduxProvider store={store}>
			<LocaleProvider>
				<div className="relative flex justify-center">
					{children}
				</div>
			</LocaleProvider>
		</ReduxProvider>
	);
};
