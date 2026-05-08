type AdSize = "leaderboard" | "in-feed" | "sidebar";

const sizeClasses: Record<AdSize, string> = {
  leaderboard: "mx-auto h-[90px] w-full max-w-[728px] sm:h-[90px]",
  "in-feed": "mx-auto h-[100px] w-full max-w-[728px] sm:h-[120px]",
  sidebar: "sticky top-6 mx-auto h-[600px] w-[300px]",
};

const sizeLabel: Record<AdSize, string> = {
  leaderboard: "728 × 90 (responsive)",
  "in-feed": "Responsive in-feed",
  sidebar: "300 × 600 half-page",
};

export function AdSlot({
  size,
  className = "",
}: {
  size: AdSize;
  className?: string;
}) {
  return (
    <aside
      role="complementary"
      aria-label="Advertisement"
      className={`${sizeClasses[size]} ${className} relative my-6 flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/40`}
    >
      <span className="absolute left-2 top-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Advertisement
      </span>
      <span className="text-xs text-zinc-400 dark:text-zinc-500">
        AdSense slot — {sizeLabel[size]}
      </span>
      {/*
        AdSense integration (replace placeholder above):

        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXX"
          crossOrigin="anonymous"
        />
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXX"
          data-ad-slot="YYYYY"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <Script id="ad-init">{`(adsbygoogle = window.adsbygoogle || []).push({});`}</Script>
      */}
    </aside>
  );
}
