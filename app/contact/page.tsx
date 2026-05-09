import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Iran Rates",
  description: "Contact information for Iran Rates.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
      <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Contact
      </h1>

      <p className="mb-4">
        For questions, corrections, or partnership inquiries, reach the
        operator at:
      </p>

      <p className="mb-4">
        <a
          href="mailto:ali.elentec@gmail.com"
          className="font-mono text-base underline"
        >
          ali.elentec@gmail.com
        </a>
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Reporting issues
      </h2>
      <p className="mb-4">
        If a rate looks wildly different from market values, please email with
        a screenshot and the timestamp shown in the header. The footer&rsquo;s
        cross-rate verification helps catch drift automatically, but human
        eyes catch edge cases too.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Source code
      </h2>
      <p>
        This site is open-source on GitHub:{" "}
        <a
          href="https://github.com/alielentec/bonbast"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          alielentec/bonbast
        </a>
        .
      </p>

      <p className="mt-8 text-xs text-zinc-400">
        <a href="/" className="underline">
          ← Back to rates
        </a>
      </p>
    </main>
  );
}
