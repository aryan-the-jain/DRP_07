export function ExitScreen() {
  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[#faf7f1] px-4 text-stone-900">
      <article className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(68,52,35,0.12)]">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eee6da] font-serif text-2xl text-stone-600">
            ♥
          </div>
        </div>

        <h1 className="mb-4 font-serif text-2xl font-semibold text-stone-950">
          You have gently left the room
        </h1>

        <p className="mb-6 text-sm leading-relaxed text-stone-650">
          Thank you for sharing this space with us today. Take care of yourself.
        </p>

        <div className="border-t border-stone-200 pt-5 text-xs leading-relaxed text-stone-500">
          It is now safe to close this browser tab.
        </div>
      </article>
    </main>
  );
}
