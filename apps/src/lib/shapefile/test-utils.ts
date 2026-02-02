/**
 * Shared test utilities for shapefile module tests.
 */

/**
 * Create a mock File with controlled arrayBuffer() response.
 *
 * Provides only what our code needs: arrayBuffer() returning specific bytes.
 * This isolates validation logic from platform File API implementation.
 *
 * @param name - File name
 * @param content - File content as ArrayBuffer, Uint8Array, or string
 * @param type - MIME type (default: 'application/octet-stream')
 */
export const createMockFile = (
	name: string,
	content: ArrayBuffer | Uint8Array | string,
	type = 'application/octet-stream'
): File => {
	const buffer =
		typeof content === 'string'
			? new TextEncoder().encode(content).buffer
			: content instanceof Uint8Array
				? content.buffer
				: content;

	const file = {
		name,
		size: buffer.byteLength,
		type,
		arrayBuffer: async (): Promise<ArrayBuffer> => buffer,
	} as File;

	return file;
};
