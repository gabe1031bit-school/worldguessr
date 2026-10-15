
import path from 'path';
import process from 'process';
import { execSync } from 'child_process';

const pathBuilder = (subpath) => path.join(process.cwd(), subpath);

const getCommitHash = () => {
    try {
        return execSync('git rev-parse --short HEAD')
            .toString()
            .trim();
    } catch (error) {
        return 'unknown';
    }
};

const getBuildTime = () => new Date().toISOString();

const __dirname = path.resolve();

// Render API service URL.
// Remove trailing slashes to prevent malformed proxy destinations.
const apiUrl = process.env.API_URL?.replace(/\/+$/, '');

const nextConfig = {
    allowedDevOrigins: ['*.trycloudflare.com'],

    basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,

    assetPrefix:
        process.env.NEXT_PUBLIC_POKI === 'true' ||
        process.env.NEXT_PUBLIC_6X === 'true'
            ? '.'
            : undefined,

    skipTrailingSlashRedirect:
        process.env.NEXT_PUBLIC_POKI === 'true' ||
        process.env.NEXT_PUBLIC_6X === 'true'
            ? true
            : undefined,

    distDir: process.env.NEXT_DIST_DIR || '.next',

    env: {
        NEXT_PUBLIC_COMMIT_HASH: getCommitHash(),
        NEXT_PUBLIC_BUILD_TIME: getBuildTime(),
    },

    webpack: (config, { webpack }) => {
        return config;
    },

    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },

    images: {
        unoptimized: true,
    },

    // Server mode is required for Next.js to handle external rewrites.
    // Do not restore output: 'export' for this deployment.
    async rewrites() {
        const routes = [
            // Preserve the existing map route.
            {
                source: '/map/:slug',
                destination: '/map?s=:slug',
            },
        ];

        if (apiUrl) {
            routes.push(
                // API requests.
                {
                    source: '/api/:path*',
                    destination: `${apiUrl}/api/:path*`,
                },

                // Game data endpoints.
                {
                    source: '/allCountries.json',
                    destination: `${apiUrl}/allCountries.json`,
                },
                {
                    source: '/countryLocations/:country',
                    destination: `${apiUrl}/countryLocations/:country`,
                },
                {
                    source: '/mapLocations/:slug',
                    destination: `${apiUrl}/mapLocations/:slug`,
                },
                {
                    source: '/mapPlay/:slug',
                    destination: `${apiUrl}/mapPlay/:slug`,
                }
            );
        }

        return routes;
    },
};

export default nextConfig;
