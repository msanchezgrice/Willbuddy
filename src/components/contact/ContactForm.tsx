"use client";

import { useState, type FormEvent } from "react";
import { captureAnalyticsEvent } from "@/lib/analytics/client";

type Status =
  | { type: "idle"; message: "" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus({ type: "idle", message: "" });

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        topic: formData.get("topic"),
        message: formData.get("message"),
      }),
    });

    if (response.ok) {
      captureAnalyticsEvent("contact_form_submitted", {
        topic: String(formData.get("topic") ?? "Support"),
      });
      form.reset();
      setStatus({
        type: "success",
        message: "Thanks. We received your message and will reply by email.",
      });
    } else {
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setStatus({
        type: "error",
        message: body?.error ?? "Something went wrong. Email support instead.",
      });
    }

    setPending(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      data-testid="contact-form"
      data-agent-form="contact"
      className="space-y-5 rounded-2xl border border-[#E8E0D6] bg-white p-6 shadow-sm md:p-8"
    >
      <div>
        <label
          className="mb-2 block text-sm font-medium text-[#2D2A26]"
          htmlFor="name"
        >
          Name
        </label>
        <input
          className="w-full rounded-xl border border-[#E8E0D6] bg-[#FAF8F5] px-4 py-3 text-sm outline-none transition focus:border-[#5B7A5E]"
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={120}
          required
        />
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-[#2D2A26]"
          htmlFor="email"
        >
          Email
        </label>
        <input
          className="w-full rounded-xl border border-[#E8E0D6] bg-[#FAF8F5] px-4 py-3 text-sm outline-none transition focus:border-[#5B7A5E]"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-[#2D2A26]"
          htmlFor="topic"
        >
          Topic
        </label>
        <select
          className="w-full rounded-xl border border-[#E8E0D6] bg-[#FAF8F5] px-4 py-3 text-sm outline-none transition focus:border-[#5B7A5E]"
          id="topic"
          name="topic"
          defaultValue="Support"
        >
          <option>Support</option>
          <option>Billing</option>
          <option>Privacy</option>
          <option>Attorney review</option>
        </select>
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-[#2D2A26]"
          htmlFor="message"
        >
          Message
        </label>
        <textarea
          className="min-h-36 w-full rounded-xl border border-[#E8E0D6] bg-[#FAF8F5] px-4 py-3 text-sm outline-none transition focus:border-[#5B7A5E]"
          id="message"
          name="message"
          maxLength={4000}
          required
        />
      </div>
      <button
        className="w-full rounded-full bg-[#5B7A5E] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#5B7A5E]/20 transition hover:bg-[#4A6A4D] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
        data-testid="contact-submit"
        data-agent-action="submit-contact-form"
      >
        {pending ? "Sending..." : "Send message"}
      </button>
      {status.message ? (
        <p
          className={
            status.type === "success"
              ? "text-sm font-medium text-[#5B7A5E]"
              : "text-sm font-medium text-red-700"
          }
          role="status"
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
