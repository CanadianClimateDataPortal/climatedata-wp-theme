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
 * - iconv-lite: top-level require$1('iconv-lite') at line 3951 — only used
 *   for .dbf character encoding, never hit by our .shp/.prj pipeline
 * - Buffer: mapshaper.js line 154 runs at module load time:
 *     var B$3 = typeof Buffer != 'undefined' ? Buffer : require$1('buffer').Buffer;
 *   In browser, require$1 is a no-op returning undefined → TypeError.
 *   We inject a minimal Uint8Array-backed Buffer on globalThis so the
 *   typeof check passes and require$1('buffer') is never reached.
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
        'iconv-lite': [
            'export function encodingExists() { return false; }',
            'export function encode(str) { return new TextEncoder().encode(str); }',
            'export function decode(buf) { return new TextDecoder().decode(buf); }',
            'export const encodings = {};',
            'export default { encodingExists, encode, decode, encodings };',
        ].join('\n'),
    };

    // Minimal Buffer polyfill covering the 6 methods mapshaper uses:
    // allocUnsafe, from, isBuffer, concat, alloc, toString
    const bufferPolyfill = [
        'if (typeof globalThis.Buffer === "undefined") {',
        '  class _B extends Uint8Array {',
        '    static alloc(n) { return new _B(n); }',
        '    static allocUnsafe(n) { return new _B(n); }',
        '    static isBuffer(o) { return o instanceof _B; }',
        '    static from(v, a, b) {',
        '      if (typeof v === "string") return new _B(new TextEncoder().encode(v));',
        '      if (v instanceof ArrayBuffer) return typeof a === "number" ? new _B(v, a, b) : new _B(v);',
        '      if (ArrayBuffer.isView(v)) return new _B(v.buffer, v.byteOffset, v.byteLength);',
        '      return new _B(v);',
        '    }',
        '    static concat(list) {',
        '      const total = list.reduce((s, b) => s + b.length, 0);',
        '      const result = new _B(total);',
        '      let offset = 0;',
        '      for (const buf of list) { result.set(buf, offset); offset += buf.length; }',
        '      return result;',
        '    }',
        '    toString(encoding) {',
        '      return new TextDecoder(encoding || "utf-8").decode(this);',
        '    }',
        '  }',
        '  globalThis.Buffer = _B;',
        '}',
    ].join('\n');

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
        transform(code, id) {
            if (!id.includes('node_modules/mapshaper/mapshaper.js')) return null;
            // Force mapshaper's require shim to the browser no-op path.
            // Without this, @rollup/plugin-commonjs provides a `require`
            // function that intercepts require$1('iconv-lite') etc. and
            // throws via the dynamic-require shim. The no-op path returns
            // undefined for optional deps, which is safe — mapshaper guards
            // usage with runningInBrowser() or try/catch.
            const patched = code.replace(
                "typeof require == 'function'",
                "typeof undefined == 'function'",
            );
            return bufferPolyfill + '\n' + patched;
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
