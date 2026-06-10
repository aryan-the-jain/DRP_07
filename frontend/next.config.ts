import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The quiet space moved from a flat /quiet/* list to grouped routes
  // (/write, /calm, /draw, /resources). Keep old links working.
  async redirects() {
    return [
      { source: "/quiet", destination: "/calm/breathe", permanent: false },
      { source: "/quiet/breathe", destination: "/calm/breathe", permanent: false },
      { source: "/quiet/steady", destination: "/calm/steady", permanent: false },
      {
        source: "/quiet/meditation",
        destination: "/calm/meditation",
        permanent: false,
      },
      { source: "/quiet/doodle", destination: "/draw", permanent: false },
      { source: "/quiet/resources", destination: "/resources", permanent: false },
      { source: "/quiet/guided", destination: "/write/guided", permanent: false },
      { source: "/quiet/free", destination: "/write/free", permanent: false },
      { source: "/quiet/facilitator", destination: "/facilitator", permanent: false },
    ];
  },
};

export default nextConfig;
