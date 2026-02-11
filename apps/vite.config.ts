import path from "path";
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'

/**
 * Stub Node.js built-in modules that mapshaper requires but cannot
 * run in the browser, while ensuring real npm dependencies resolve
 * correctly at runtime.
 *
 * Mapshaper (mapshaper.js lines 137-151) has an internal require shim:
 *   if (typeof require == 'function')       → use native require (Node.js)
 *   else if (window.modules)                → use window.modules[name]
 *   else                                    → no-op (returns undefined)
 *
 * When bundled by Vite/Rollup, @rollup/plugin-commonjs provides a
 * `require` function, so branch 1 fires. But the CJS plugin's dynamic
 * require shim can't resolve mapshaper's internal require$1() calls
 * at runtime → throws "Could not dynamically require".
 *
 * Strategy (3 layers):
 *
 * 1. REQUIRE SHIM BYPASS — patch `typeof require == 'function'` to
 *    always false. This prevents @rollup/plugin-commonjs from
 *    hijacking mapshaper's require calls. Falls to branch 2.
 *
 * 2. WINDOW.MODULES BRIDGE — a virtual wrapper module intercepts
 *    `import mapshaper from 'mapshaper'`. The wrapper imports real
 *    npm dependencies (flatbush, kdbush, mproj, iconv-lite, etc.)
 *    via standard ESM imports and populates `window.modules` so the
 *    branch 2 shim finds them. Then re-exports actual mapshaper.
 *    Node.js builtins (fs, path, etc.) are NOT in window.modules,
 *    so require$1('fs') returns undefined — safe because mapshaper
 *    guards those with runningInBrowser() or try/catch.
 *
 * 3. BUFFER POLYFILL — inject minimal Uint8Array-backed Buffer on
 *    globalThis so mapshaper.js line 154 (`typeof Buffer != 'undefined'`)
 *    passes without hitting require$1('buffer').
 *
 * Node.js builtins are also stubbed as virtual modules via resolveId/load
 * because mapshaper's transitive deps (mproj, iconv-lite/safer-buffer)
 * import them directly. Without stubs, Vite externalizes them, producing
 * broken references at runtime.
 */
function mapshaperNodeStubs(): Plugin {
    // Node.js builtins and server-only packages that need virtual stubs.
    // These are imported both by mapshaper.js (via require$1, neutralized
    // by the shim bypass) and by its transitive deps (mproj → fs/path,
    // iconv-lite → safer-buffer → buffer).
    const stubs: Record<string, string> = {
        zlib: 'export default {};',
        fs: [
            'export function readFileSync() { return ""; }',
            'export function writeFileSync() {}',
            'export function mkdirSync() {}',
            'export function readdirSync() { return []; }',
            'export function existsSync() { return false; }',
            'export function statSync() { return { isFile: () => false, isDirectory: () => false }; }',
            'export default { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync };',
        ].join('\n'),
        path: [
            'export function join(...args) { return args.filter(Boolean).join("/"); }',
            'export function resolve(...args) { return args.filter(Boolean).join("/"); }',
            'export function dirname(p) { return p.split("/").slice(0, -1).join("/"); }',
            'export function basename(p) { return p.split("/").pop() || ""; }',
            'export default { join, resolve, dirname, basename };',
        ].join('\n'),
        os: [
            'export function endianness() {',
            '  const b = new ArrayBuffer(2);',
            '  new DataView(b).setInt16(0, 256, true);',
            '  return new Int16Array(b)[0] === 256 ? "LE" : "BE";',
            '}',
            'export default { endianness };',
        ].join('\n'),
        url: [
            'export function pathToFileURL(p) { return new URL("file://" + p); }',
            'export default { pathToFileURL };',
        ].join('\n'),
        child_process: [
            'export function exec() { throw new Error("child_process not available in browser"); }',
            'export default { exec };',
        ].join('\n'),
        // Buffer stub must define the polyfill inline because safer-buffer
        // (iconv-lite dep) accesses Buffer.prototype at module load time,
        // before mapshaper.js runs. The polyfill must exist the moment any
        // module does require('buffer').
        buffer: [
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
            'export const Buffer = globalThis.Buffer;',
            'export default { Buffer: globalThis.Buffer };',
        ].join('\n'),
        stream: 'export default {};',
        rw: [
            'export function readFileSync() { return ""; }',
            'export function writeFile(p, c, cb) { if (cb) cb(); }',
            'export default { readFileSync, writeFile };',
        ].join('\n'),
        'sync-request': [
            'export default function() { throw new Error("sync-request not available in browser"); };',
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

    // Virtual wrapper module for mapshaper that:
    // 1. Imports real npm deps via standard ESM resolution
    // 2. Populates window.modules so mapshaper's branch-2 shim finds them
    // 3. Re-exports the real mapshaper module
    const WRAPPER_ID = '\0mapshaper-browser-wrapper';
    const wrapperSource = [
        'import _ms_flatbush from "flatbush";',
        'import _ms_kdbush from "kdbush";',
        'import * as _ms_iconv from "iconv-lite";',
        'import _ms_mproj from "mproj";',
        'import * as _ms_geographiclib from "geographiclib-geodesic";',
        'if (typeof window !== "undefined") {',
        '  if (!window.modules) window.modules = {};',
        '  window.modules["flatbush"] = _ms_flatbush;',
        '  window.modules["kdbush"] = _ms_kdbush;',
        '  window.modules["iconv-lite"] = _ms_iconv;',
        '  window.modules["mproj"] = _ms_mproj;',
        '  window.modules["geographiclib-geodesic"] = _ms_geographiclib;',
        '}',
        // Re-export the real mapshaper (resolved by Rollup, not intercepted
        // because the importer is this virtual module which starts with \0)
        'export { default } from "mapshaper";',
    ].join('\n');

    return {
        name: 'mapshaper-node-stubs',
        enforce: 'pre',
        resolveId(id, importer) {
            // Intercept 'mapshaper' imports from application code and
            // redirect to our wrapper. Imports from the wrapper itself
            // (virtual module IDs starting with \0) pass through to
            // resolve the real mapshaper from node_modules.
            if (id === 'mapshaper' && importer && !importer.startsWith('\0')) {
                return WRAPPER_ID;
            }
            // Stub Node.js builtins for both mapshaper and its transitive
            // deps (mproj → fs/path, iconv-lite → safer-buffer → buffer)
            if (id in stubs) return `\0stub:${id}`;
            return null;
        },
        load(id) {
            if (id === WRAPPER_ID) return wrapperSource;
            const match = id.match(/^\0stub:(.+)$/);
            if (match && match[1] in stubs) return stubs[match[1]];
            return null;
        },
        transform(code, id) {
            if (!id.includes('node_modules/mapshaper/mapshaper.js')) return null;

            // Layer 1: Bypass mapshaper's require shim so it uses
            // window.modules (branch 2) instead of @rollup/plugin-commonjs's
            // require (branch 1) which throws on dynamic requires.
            const patched = code.replace(
                "typeof require == 'function'",
                "typeof undefined == 'function'",
            );

            // Layer 3: Prepend Buffer polyfill so mapshaper.js line 154
            // (`typeof Buffer != 'undefined'`) passes. Also defined in the
            // buffer stub for safer-buffer, but mapshaper's top-level check
            // runs first. The if-guard prevents double initialization.
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
