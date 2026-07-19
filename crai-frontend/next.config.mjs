import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = { 
    reactCompiler: true,
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cr-ai.cloud',
            },
            {
                protocol: "https",
                hostname: "api.cr-ai.cloud",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "8000",
                pathname: "/media/**",
            },
            {
                protocol: "https",
                hostname: "swiperjs.com",
            },
        ],
    },
};

export default withNextIntl(nextConfig);
