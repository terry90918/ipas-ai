import type { NextConfig } from 'next';
const config: NextConfig = { agentRules: false, experimental: { agentUpgrade: 'security' }, images: { unoptimized: true }, poweredByHeader: false };
export default config;
