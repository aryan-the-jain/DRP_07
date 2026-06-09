"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Shortcut sidebar item: redirects to the existing /facilitator route.
export default function FacilitatorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/facilitator");
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[15px] text-muted">
        Opening your conversation with the facilitator…
      </p>
    </div>
  );
}
