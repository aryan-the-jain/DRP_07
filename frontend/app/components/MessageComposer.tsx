import { FormEvent } from "react";

type MessageComposerProps = {
  activeTab: "group" | "facilitator";
  facilitatorName: string;
  messageBody: string;
  isSending: boolean;
  isLoading: boolean;
  errorMessage: string;
  onMessageBodyChange: (value: string) => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
};

export function MessageComposer({
  activeTab,
  facilitatorName,
  messageBody,
  isSending,
  isLoading,
  errorMessage,
  onMessageBodyChange,
  onSendMessage,
}: MessageComposerProps) {
  return (
    <footer className="shrink-0 border-t border-stone-200 bg-[#faf7f1] px-4 py-4 sm:px-5">
      <form
        onSubmit={onSendMessage}
        className="mx-auto flex max-w-4xl items-center gap-3"
      >
        <label className="sr-only" htmlFor="message">
          Message
        </label>
        <input
          id="message"
          className="min-h-12 flex-1 rounded-full border border-stone-300 bg-white px-5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
          placeholder={
            activeTab === "group"
              ? "Type message..."
              : `Type a private message to ${facilitatorName}...`
          }
          value={messageBody}
          onChange={(event) => onMessageBodyChange(event.target.value)}
          disabled={isSending || isLoading}
        />
        <button
          type="submit"
          disabled={isSending || isLoading}
          className="flex h-12 min-w-12 items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          {isSending ? "..." : "Send"}
        </button>
      </form>

      {errorMessage && (
        <p className="mx-auto mt-3 max-w-4xl text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </footer>
  );
}
