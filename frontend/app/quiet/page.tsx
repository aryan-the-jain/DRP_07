"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// The /quiet landing page redirects to the default sub-feature. With each quiet
// feature now having its own sidebar link, there is no combined view any more.
export default function QuietRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/quiet/breathe");
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[15px] text-muted">Opening your quiet space…</p>
    </div>
  );
}
