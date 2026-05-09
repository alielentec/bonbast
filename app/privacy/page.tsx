import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Iran Rates",
  description: "Privacy policy for Iran Rates.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
      <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Privacy Policy
      </h1>
      <p className="mb-2 text-xs text-zinc-400">
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        What we collect
      </h2>
      <p className="mb-4">
        Iran Rates does not require user accounts and does not directly
        collect personal information. The site is statically rendered and
        served from a content delivery network.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Cookies and analytics
      </h2>
      <p className="mb-4">
        We may use Google Analytics or Vercel Analytics to understand traffic
        patterns in aggregate. These tools may set cookies in your browser.
        Aggregated traffic counts (visits, page views, country) are
        retained; individual user behavior is not tracked.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Advertising
      </h2>
      <p className="mb-4">
        We may display advertisements served by Google AdSense. Google and
        its partners may use cookies to serve ads based on your prior visits
        to this site or other websites. You can opt out of personalized
        advertising by visiting{" "}
        <a
          href="https://adssettings.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Google&rsquo;s Ad Settings
        </a>
        . For more information about how Google uses cookies in advertising,
        see{" "}
        <a
          href="https://policies.google.com/technologies/ads"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Google&rsquo;s advertising policy
        </a>
        .
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Third-party data
      </h2>
      <p className="mb-4">
        Currency and gold prices are fetched from{" "}
        <a
          href="https://www.tgju.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          tgju.org
        </a>
        . Cross-rate verification uses{" "}
        <a
          href="https://www.frankfurter.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Frankfurter
        </a>
        . These requests happen server-side; your browser does not connect
        to those services directly.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Contact
      </h2>
      <p>
        Questions? Email{" "}
        <a
          href="mailto:ali.elentec@gmail.com"
          className="font-mono underline"
        >
          ali.elentec@gmail.com
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
