import { forwardRef } from "react";
import type { ShareData } from "@/app/lib/share";
import { SITE_NAME, SITE_URL } from "@/app/lib/share";

// 1080×1080 social-friendly share card. Inline styles only — html-to-image
// captures more reliably without depending on stylesheet parse-state.

const FLAG = (code: string) => `/flags/L/${code}.svg`;

export const ShareCard = forwardRef<
  HTMLDivElement,
  ShareData & { fromFlag: string; toFlag: string }
>(function ShareCard(
  {
    fromCode,
    fromAmount,
    toCode,
    toAmount,
    ratePerOne,
    tehran,
    local,
    localLabel,
    fromFlag,
    toFlag,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        boxSizing: "border-box",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
        background: "#ffffff",
        color: "#0f172a",
        padding: 64,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* === Brand strip ============================================ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            borderRadius: 999,
            background: "#10b981",
            boxShadow: "0 0 0 5px rgba(16,185,129,0.18)",
          }}
        />
        <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.01em" }}>
          {SITE_NAME}
        </span>
        <span
          style={{
            fontSize: 18,
            color: "#94a3b8",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Live Market
        </span>
      </div>

      {/* === Calculation hero — centered vertically ================== */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 36,
        }}
      >
        <Hero flag={fromFlag} amount={fromAmount} code={fromCode} />

        {/* Equals/arrow connector */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 999,
            background: "#ecfdf5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#10b981",
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          ↓
        </div>

        <Hero flag={toFlag} amount={toAmount} code={toCode} highlight />
      </div>

      {/* === Rate + timestamps ====================================== */}
      <div
        style={{
          paddingTop: 28,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <Stamp label="Rate" value={ratePerOne} valueWeight={600} />
        <Stamp label="Tehran" sublabel="Shamsi" value={tehran} mono />
        <Stamp label={localLabel} value={local} mono />
      </div>

      {/* === Footer ================================================= */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 22,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: 22,
        }}
      >
        <span style={{ color: "#64748b" }}>Live free-market rates</span>
        <span style={{ fontWeight: 700, color: "#0f172a", letterSpacing: "0.01em" }}>
          {SITE_URL}
        </span>
      </div>
    </div>
  );
});

// --------------------------------------------------------------------
// Hero block — flag chip + huge amount + currency code on one row.
// Centered horizontally so source and target read as balanced peers.
// --------------------------------------------------------------------
function Hero({
  flag,
  amount,
  code,
  highlight,
}: {
  flag: string;
  amount: string;
  code: string;
  highlight?: boolean;
}) {
  const accent = highlight ? "#059669" : "#0f172a";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        // Slight tone background for the highlighted (target) row to draw
        // the eye to the answer.
        background: highlight ? "#f0fdf4" : "transparent",
        padding: highlight ? "18px 28px" : "8px 28px",
        borderRadius: highlight ? 20 : 0,
      }}
    >
      <span
        style={{
          width: 96,
          height: 72,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
          display: "inline-block",
          flexShrink: 0,
        }}
      >
        {/* Direct <img> so the SVG fills the entire container. flagpack's
            Flag component preserves intrinsic SVG dimensions which made the
            flag look like a stamp inside an empty card. */}
        <img
          src={FLAG(flag)}
          alt=""
          width={96}
          height={72}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </span>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: accent,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {amount}
        </span>
        <span
          style={{
            marginTop: 8,
            fontSize: 28,
            fontWeight: 700,
            color: highlight ? "#047857" : "#475569",
            letterSpacing: "0.08em",
          }}
        >
          {code}
        </span>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------
// Stamp — single-line label + value, with consistent left column for
// the labels so the values line up in a clean grid.
// --------------------------------------------------------------------
function Stamp({
  label,
  sublabel,
  value,
  mono,
  valueWeight = 500,
}: {
  label: string;
  sublabel?: string;
  value: string;
  mono?: boolean;
  valueWeight?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 200,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#94a3b8",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span
            style={{
              padding: "3px 8px",
              background: "#f1f5f9",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              color: "#64748b",
              letterSpacing: 0,
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: mono
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : "inherit",
          fontSize: 26,
          fontWeight: valueWeight,
          color: "#1e293b",
          letterSpacing: mono ? "-0.01em" : "0",
        }}
      >
        {value}
      </span>
    </div>
  );
}
