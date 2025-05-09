import path from "path";
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
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
        manifest: true,
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
        proxy: {
            // Proxy for the ClimateData API, this is used to avoid CORS issues when developing locally but it might be worth keeping it
            '/fileserver': {
                target: 'https://data.climatedata.ca',
                changeOrigin: true,
                secure: false,
            },
        },
    }
})
