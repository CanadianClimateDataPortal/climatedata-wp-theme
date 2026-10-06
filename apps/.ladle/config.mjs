
const styles = `
	#ladle-root {
		--ladle-bg-color-primary: hsl(var(--background));
	}
`;

// Ladle runs inside the task-runner container. Its live reload uses a
// websocket on a port of its own, separate from 61000. By default that
// websocket listens on `localhost` inside the container, which a Docker port
// mapping cannot reach, so the browser logs "[vite] failed to connect to
// websocket". Each developer sets LADLE_HMR_PORT and publishes that same port
// in their own compose.override.yaml. The browser dials the same host and
// port, hence ws://0.0.0.0:<port>. When the variable is unset, Ladle keeps
// its defaults. Setup: docs/developing-with-ladle.md
const hmrPort = Number(process.env.LADLE_HMR_PORT) || undefined;

/**
 * Bookmarks:
 * @see {@link https://ladle.dev/docs/config#ladleconfigmjs}
 *
 * @type {import('@ladle/react').UserConfig}
 */
export default {
	hmrHost: hmrPort ? '0.0.0.0' : undefined,
	hmrPort,
	appendToHead: `
		<style>${styles}</style>
	`,
};
