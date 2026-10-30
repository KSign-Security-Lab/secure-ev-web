import type { NextConfig } from "next";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const nextConfig: NextConfig = {
  // The C2 engine is a workspace package shipped as TypeScript source.
  transpilePackages: ["@secure-ev-web/c2-core"],
};

export default nextConfig;
