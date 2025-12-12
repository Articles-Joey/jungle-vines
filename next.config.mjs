/** @type {import('next').NextConfig} */
const nextConfig = {
    // TODO: Swap when Next 16
    // reactCompiler: true,
    experimental: {
        reactCompiler: true,
    },
    poweredByHeader: false,
    images: {
        // domains: ['cdn.articles.media', 'articles-website.s3.amazonaws.com', 'd3bzp9rk94ifwy.cloudfront.net'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.articles.media',
                port: '',
                // pathname: '',
            },
            {
                protocol: 'https',
                hostname: 'articles-website.s3.amazonaws.com',
                port: '',
                // pathname: '',
            },
        ],
    },
};

export default nextConfig;
