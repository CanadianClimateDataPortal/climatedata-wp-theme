export type TailwindBreakpointName =
	// Corresponds to Tailwind CSS default breakpoints
	| 'base'
	// Smallest breakpoint
	| 'sm'
	// Medium breakpoint
	| 'md'
	// Large breakpoint
	| 'lg'
	// Extra large breakpoint
	| 'xl'
	// 2x extra large breakpoint
	| '2xl';

/**
 * Extended MediaQueryList with Tailwind breakpoint name.
 */
export interface TailwindBreakPoint extends MediaQueryList {
	name: TailwindBreakpointName;
}

/**
 * Get the current Tailwind CSS breakpoint as a MediaQueryList with an added `name` property.
 */
export const getCurrentBreakpoint = (): TailwindBreakPoint => {
	// The list was found by getting `@media` rules from the main CSS file served from production build.
	const breakpoints = [
		{ name: '2xl', query: '(min-width: 1536px)' },
		{ name: 'xl', query: '(min-width: 1280px)' },
		{ name: 'lg', query: '(min-width: 1024px)' },
		{ name: 'md', query: '(min-width: 768px)' },
		{ name: 'sm', query: '(min-width: 640px)' },
		{ name: 'base', query: '(min-width: 0px)' },
	] satisfies Array<{ name: TailwindBreakpointName; query: string }>;

	// Iterate from largest to smallest to find the first matching breakpoint
	const active = breakpoints.find((bp) => window.matchMedia(bp.query).matches);

	// Build up the MediaQueryList with name
	const name = active ? active.name : 'base';
	const query = active ? active.query : '(min-width: 0px)';
	const out = window.matchMedia(query);

	// Augment `MediaQueryList` with name property
	Object.defineProperty(out, 'name', {
		value: name,
		enumerable: true,
		writable: false,
	});

	return out as TailwindBreakPoint;
};

/**
 * Check if a class selector exists in any loaded stylesheet
 */
export const checkClassNameExists = (className: string): boolean => {
	const selector = `.${className.replace(/[.:]/g, '\\$&')}`;

	try {
		for (const sheet of document.styleSheets) {
			try {
				for (const rule of sheet.cssRules) {
					if (rule instanceof CSSStyleRule) {
						if (rule.selectorText?.includes(selector)) {
							return true;
						}
					}
					// Check @media rules for responsive classes
					if (rule instanceof CSSMediaRule) {
						for (const mediaRule of rule.cssRules) {
							if (mediaRule instanceof CSSStyleRule) {
								if (mediaRule.selectorText?.includes(selector)) {
									return true;
								}
							}
						}
					}
				}
			} catch {
				// Cross-origin stylesheets throw SecurityError
				continue;
			}
		}
	} catch {
		return false;
	}

	return false;
};
