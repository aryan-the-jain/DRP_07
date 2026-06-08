"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { AvatarCircle, BrandMark } from "../components/DesignPrimitives";
import { fallbackApiUrl, signUpParticipant } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [customName, setCustomName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  function handleDemoSignIn(id: number) {
    localStorage.setItem("current_participant_id", id.toString());
    router.push("/dashboard");
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = customName.trim();
    if (!name) {
      setErrorMessage("Please enter your name first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const participant = await signUpParticipant(apiUrl, name);
      localStorage.setItem("current_participant_id", participant.id.toString());
      router.push("/onboarding");
    } catch {
      setErrorMessage("We couldn't register you. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="fixed inset-0 flex items-center justify-center bg-paper p-4 sm:p-6 text-ink overflow-y-auto">
      <div className="sk v2 w-full max-w-md bg-card p-6 sm:p-8 flex flex-col gap-6 animate-fadeIn shadow-[0_12px_36px_rgba(68,52,35,0.08)] my-auto">
        <header className="flex flex-col items-center gap-2 text-center">
          <BrandMark />
          <h1 className="h-title text-3xl mt-3 text-ink">Welcome.</h1>
          <p className="text-sm text-muted leading-relaxed max-w-xs">
            A gentle, shared space for peer support. Take a moment to breathe and settle in.
          </p>
        </header>

        <div className="divider" aria-hidden="true" />

        {/* Demo Users Section */}
        <section className="flex flex-col gap-3">
          <h2 className="leader [color:var(--warm)] mb-1">
            Sign in as a demo user
          </h2>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleDemoSignIn(9)}
              className="text-left w-full p-4 sk thin soft bg-card hover:border-warm hover:bg-warm-soft transition-all duration-200 flex items-center gap-4 group cursor-pointer"
            >
              <AvatarCircle initials="A" tone="warm" sizeClass="h-12 w-12 text-lg" />
              <div>
                <h3 className="font-semibold text-ink group-hover:text-warm-ink transition-colors">
                  Alice
                </h3>
                <p className="text-xs text-muted">
                  22 · Early grief, loves morning photography.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn(10)}
              className="text-left w-full p-4 sk thin soft bg-card hover:border-warm hover:bg-warm-soft transition-all duration-200 flex items-center gap-4 group cursor-pointer"
            >
              <AvatarCircle initials="B" tone="warm" sizeClass="h-12 w-12 text-lg" />
              <div>
                <h3 className="font-semibold text-ink group-hover:text-warm-ink transition-colors">
                  Bob
                </h3>
                <p className="text-xs text-muted">
                  24 · Early grief, plays acoustic guitar.
                </p>
              </div>
            </button>
          </div>
        </section>

        <div className="divider" aria-hidden="true" />

        {/* Custom Sign-up Section */}
        <section className="flex flex-col gap-3">
          <h2 className="leader mb-1">Or join as a new member</h2>
          <form onSubmit={handleSignUp} className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="What should we call you?"
                disabled={isLoading}
                maxLength={40}
                className="field"
                aria-label="Your display name"
              />
            </div>

            {errorMessage && (
              <p role="alert" className="text-xs text-center text-warm-ink font-semibold">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !customName.trim()}
              className="btn warm w-full cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? "Settling in…" : "Start my journey"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
