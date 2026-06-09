"use client";

import { ReactNode } from "react";

import { SidebarLayout } from "../components/SidebarLayout";
import { QuietSpaceProvider } from "../lib/QuietSpaceContext";

// Wraps every /quiet/* sub-page with the sidebar and the shared quiet-space
// context so reflection state is preserved as the visitor moves between the
// individual quiet features.
export default function QuietLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout>
      <QuietSpaceProvider>
        <main className="h-full overflow-hidden bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
          <section className="panel mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
            {children}
          </section>
        </main>
      </QuietSpaceProvider>
    </SidebarLayout>
  );
}
