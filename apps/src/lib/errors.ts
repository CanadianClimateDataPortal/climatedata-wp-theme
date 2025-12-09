/**
 * Base error class with enhanced error chaining support.
 *
 * Provides:
 * - Automatic error naming via constructor.name
 * - Stack trace merging for error causes
 * - Consistent error handling pattern across the codebase
 *
 * It should be preserving the original error cause and provides
 * merged stack traces for debugging.
 *
 * @example
 * ```typescript
 * class ValidationError extends AbstractError {
 * 	constructor(message: string, options?: ErrorOptions) {
 * 		super(message, options);
 * 		this.name = 'ValidationError'; // Otherwise we do not get a useful name
 * 	}
 * }
 *
 * throw new ValidationError('Invalid data', {
 *   cause: originalError
 * });
 * ```
 */
export abstract class AbstractError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		// Automatically sets name to FetchError, ValidationError, etc.
		// Due to WebPack minification, we can't really use this to give a useful name.
		// So we will have to set the name explicitly in subclasses.
		this.name = this.constructor.name;
	}

	get stack(): string | undefined {
		const baseStack = super.stack;
		const cause = this.cause;
		// If there's no cause or cause has no stack, just return the base stack
		if (!cause || !(cause instanceof Error) || !cause.stack) {
			return baseStack;
		}
		// Merge: show this error's stack, then the cause's stack for a full error chain
		return `${baseStack}\nCaused by: ${cause.stack}`;
	}
}
