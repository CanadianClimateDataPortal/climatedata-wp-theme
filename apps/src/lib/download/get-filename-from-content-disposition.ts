
/**
 * Reads the file name out of a `Content-Disposition` response header.
 *
 * The RFC 6266 `filename*=` parameter wins over `filename=` when both are present.
 * Its value is RFC 5987 encoded, as in `UTF-8''<percent-encoded>`.
 * A quoted `filename=` value runs up to its closing quote, so it may hold `;`, `=`, `&` and spaces.
 * The screenshot service puts the map query string into that name, which brings all of those.
 *
 * @returns The file name, or `null` when the header is absent or names no file.
 */
export const getFilenameFromContentDisposition = (
	contentDisposition: string | null,
): string | null => {
	if (!contentDisposition) {
		return null;
	}

	const extended = /(?:^|;)\s*filename\*\s*=\s*UTF-8'[^']*'([^;\s]+)/i.exec(
		contentDisposition,
	);
	if (extended) {
		try {
			return decodeURIComponent(extended[1]);
		} catch {
			// Malformed percent-encoding: fall back to the plain `filename=` parameter.
		}
	}

	const plain =
		/(?:^|;)\s*filename\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^;]*))/i.exec(
			contentDisposition,
		);
	if (!plain) {
		return null;
	}
	// The unquoted branch also catches a malformed value with an opening quote
	// but no closing one, so drop that stray leading quote from the name.
	const filename =
		plain[1] !== undefined ?
			plain[1].replace(/\\(.)/g, '$1') :
			plain[2].trim().replace(/^"/, '');

	return filename || null;
};
