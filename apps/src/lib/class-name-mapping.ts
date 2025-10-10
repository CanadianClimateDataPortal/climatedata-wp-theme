/**
 * Generic factory for component class name mappings
 */
export type ClassNameMapping<T extends Record<string, string>> = T;

/**
 * Manages CSS class name retrieval with type safety and validation.
 *
 * Provides a consistent interface for accessing predefined class name
 * mappings while ensuring type safety and runtime validation.
 * Designed to separate presentational class names from component logic,
 * enabling better testability and maintainability.
 *
 * @typeParam T - The shape of class name mapping (e.g., ProgressBarClassNames)
 */
export interface ClassNameMappingHelper<T extends Record<string, string>> {
	/**
	 * Get class names for a given key, or default if no key provided
	 * @param key - Optional key to lookup, uses default if omitted
	 * @throws Error if key not found or no default specified
	 */
	get: (key?: string) => T;
}

export function createClassNameMappingHelper<T extends Record<string, string>>(
	mappings: ReadonlyMap<string, T>,
	defaultKey?: string,
): ClassNameMappingHelper<T> {
	const get = (key?: string): T => {
		const lookupKey = key ?? defaultKey;
		if (!lookupKey) {
			const message = 'No key provided and no default key specified';
			throw new Error(message);
		}
		const result = mappings.get(lookupKey);
		if (!result) {
			const message = `No class names for key: "${lookupKey}"`;
			throw new Error(message);
		}
		return result;
	};

	return {
		get,
	};
}
