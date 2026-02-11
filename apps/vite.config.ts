import path from "path";
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'

/**
 * Stub Node.js built-in modules that mapshaper imports but doesn't
 * actually use in browser context.
 *
 * - zlib: guarded by runningInBrowser() — mapshaper uses fflate instead
 * - os: only os.endianness() is called at runtime
 */
function mapshaperNodeStubs(): Plugin {
    const stubs: Record<string, string> = {
        zlib: 'export default {};',
        os: [
            'export function endianness() {',
            '  const b = new ArrayBuffer(2);',
            '  new DataView(b).setInt16(0, 256, true);',
            '  return new Int16Array(b)[0] === 256 ? "LE" : "BE";',
            '}',
            'export default { endianness };',
        ].join('\n'),
    };

    return {
        name: 'mapshaper-node-stubs',
        enforce: 'pre',
        resolveId(id) {
            if (id in stubs) return `\0stub:${id}`;
            return null;
        },
        load(id) {
            const match = id.match(/^\0stub:(.+)$/);
            if (match && match[1] in stubs) return stubs[match[1]];
            return null;
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    base: '/assets/themes/fw-child/apps/dist/',
    plugins: [
        react(),
        mapshaperNodeStubs(),
        {
            name: 'custom-startup-message',
            configureServer(server) {
                const originalLog = console.log;

                console.log = (...args) => {
                    if (args.some(arg => typeof arg === 'string' && arg.includes('Local:'))) {
                        // Suppress the original message
                        return;
                    }
                    originalLog(...args);
                }

                server.httpServer?.once('listening', () => {
                    console.log = originalLog;
                    const address = server.httpServer?.address();
                    const protocol = server.config.server.https ? 'https' : 'http';
                    if (address && typeof address !== 'string') {
                        const host = address.address === '::' || address.address === '::1' || address.address === '127.0.0.1' ? 'localhost' : address.address;
                        const port = address.port;
                        const addressString = `${protocol}://${host}:${port}`;
                        console.log('\x1b[32m%s\x1b[0m', 'Vite dev server is running! 🚀');
                        console.log('\x1b[32m%s\x1b[0m', 'This app has multiple entry points! Which you can access through:');
                        console.log('\x1b[36m%s\x1b[0m', `Map: ${addressString}/map`);
                        console.log('\x1b[36m%s\x1b[0m', `Download: ${addressString}/download`);
                    }
                });
            }
        }
    ],
    build: {
        manifest: !process.env.UNMINIFIED,
        minify: !process.env.UNMINIFIED,
        terserOptions: process.env.UNMINIFIED ? {
            compress: false,
            mangle: false,
        } : undefined,
        assetsDir: '.',
        outDir: './../fw-child/apps/dist', // Directory for build output relative to the config file
        emptyOutDir: true, // Empties the outDir on build
        rollupOptions: {
            input: {
                map: resolve(__dirname, 'map.html'),
                download: resolve(__dirname, 'download.html'),
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            '@fonts': path.resolve(__dirname, '../fw-child/resources/fonts'), // alias for the fonts folder for easier access
        },
    },
    server: {
        fs: {
            allow: [
                path.resolve(__dirname), // allow access to root
                path.resolve(__dirname, '../fw-child/resources/fonts') // allow access to the fonts folder
            ]
        },
    }
})
