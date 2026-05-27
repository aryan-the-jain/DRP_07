"use client";

import { FormEvent, useEffect, useState } from "react";

type SupportRequest = {
  id: number;
  name: string;
  email: string;
  supportType: string;
  message: string;
  status: string;
  createdAt: string;
};

type FormState = {
  name: string;
  email: string;
  supportType: string;
  message: string;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  supportType: "Peer support group",
  message: "",
};

export default function Home() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  async function fetchRequests() {
    const response = await fetch(`${apiUrl}/support-requests`);

    if (!response.ok) {
      throw new Error("Failed to fetch support requests");
    }

    const data: SupportRequest[] = await response.json();
    setRequests(data);
  }

  useEffect(() => {
    fetchRequests().catch(() => {
      setStatusMessage("Could not connect to backend.");
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const response = await fetch(`${apiUrl}/support-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create support request");
      }

      setForm(initialFormState);
      setStatusMessage("Support request saved.");
      await fetchRequests();
    } catch {
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">
          DRP Project
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
          Grief Support Platform
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-neutral-300">
          A digital touchpoint helping bereaved young adults request reliable,
          relevant formal support.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl"
          >
            <h2 className="text-2xl font-semibold">Request support</h2>

            <label className="mt-6 block">
              <span className="text-sm text-neutral-300">Name</span>
              <input
                className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm text-neutral-300">Email</span>
              <input
                type="email"
                className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                required
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm text-neutral-300">Support type</span>
              <select
                className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
                value={form.supportType}
                onChange={(event) =>
                  setForm({ ...form, supportType: event.target.value })
                }
              >
                <option>Peer support group</option>
                <option>Professional counselling</option>
                <option>Bereavement charity</option>
                <option>Not sure yet</option>
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-sm text-neutral-300">
                What do you need help with?
              </span>
              <textarea
                className="mt-2 min-h-32 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-white"
                value={form.message}
                onChange={(event) =>
                  setForm({ ...form, message: event.target.value })
                }
                required
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Submit request"}
            </button>

            {statusMessage && (
              <p className="mt-4 text-sm text-neutral-300">{statusMessage}</p>
            )}
          </form>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
            <h2 className="text-2xl font-semibold">Saved requests</h2>

            <div className="mt-6 space-y-4">
              {requests.length === 0 ? (
                <p className="text-neutral-400">No requests yet.</p>
              ) : (
                requests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{request.name}</h3>
                        <p className="text-sm text-neutral-400">
                          {request.email}
                        </p>
                      </div>

                      <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs uppercase tracking-wide text-neutral-300">
                        {request.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-medium text-neutral-300">
                      {request.supportType}
                    </p>

                    <p className="mt-2 text-neutral-400">{request.message}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}