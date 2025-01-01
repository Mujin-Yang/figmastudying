import type { NextConfig } from "next";
import {hostname} from "node:os";

const nextConfig: NextConfig = {
  /* config options here */
    images:{
        remotePatterns: [{
            protocol:'https',
            hostname: 'liveblocks.io',
            port: ''
        }]
    }
};

export default nextConfig;
