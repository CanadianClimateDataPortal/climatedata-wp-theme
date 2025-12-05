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

/**
 * Error thrown when a function's preconditions are not met at runtime.
 *
 * This error indicates that required state or arguments that should have been
 * validated earlier in the call chain were not properly checked.
 * It's used when extracting functions from deeply nested contexts where precondition
 * checks exist at the call site, but the extracted function needs to assert those same
 * conditions defensively.
 *
 * Use this error to:
 * - Signal "should never happen" conditions in refactored code
 * - Document expectations about calling context without polluting function signatures
 * - Provide clear debugging information when architectural assumptions are violated
 *
 * @example
 * ```typescript
 * function generateS2DFilename(releaseDate: Date | null) {
 *   // Call site already checked for S2D state, but we assert defensively
 *   if (!releaseDate) {
 *     throw new PreconditionError(
 *       'S2D download filename generation requires a release date. ' +
 *       'This indicates S2D state validation was bypassed in the call chain.'
 *     );
 *   }
 *   // ... generate filename
 * }
 * ```
 */
export class PreconditionError extends AbstractError {
	constructor(
		message: string,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = 'PreconditionError';
	}
}
