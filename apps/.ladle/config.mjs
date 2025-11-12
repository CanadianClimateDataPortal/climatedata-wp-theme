
const styles = `
	#ladle-root {
		--ladle-bg-color-primary: hsl(var(--background));
	}
`;

/**
 * Bookmarks:
 * @see {@link https://ladle.dev/docs/config#ladleconfigmjs}
 *
 * @type {import('@ladle/react').UserConfig}
 */
export default {
	appendToHead: `
		<style>${styles}</style>
	`,
};
