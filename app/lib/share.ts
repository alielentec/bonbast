// Share utilities. Designed to work cross-platform: text via clipboard,
// images via the Web Share API (file mode) on mobile and clipboard or
// download on desktop.

import { toPng } from "html-to-image";

export const SITE_NAME = "Iran Rates";
export const SITE_TAG = "Live Market";
// Update this once a real domain is in place.
export const SITE_URL = "iranrates.app";

export type ShareData = {
  fromCode: string;
  fromAmount: string;
  toCode: string;
  toAmount: string;
  ratePerOne: string; // "1 USD ≈ 183,850 IRR"
  tehran: string; // already-formatted Shamsi datetime
  local: string; // already-formatted local datetime
  localLabel: string; // e.g. "Local" or "Los Angeles"
};

export function buildShareText(d: ShareData): string {
  // Designed to read cleanly in WhatsApp/Telegram/SMS without rendering.
  // Plain ASCII separators (—, ≈) — supported everywhere.
  return [
    `${d.fromAmount} ${d.fromCode} = ${d.toAmount} ${d.toCode}`,
    ``,
    d.ratePerOne,
    ``,
    `Tehran:  ${d.tehran}`,
    `${d.localLabel.padEnd(7)} ${d.local}`,
    ``,
    `via ${SITE_NAME} — ${SITE_URL}`,
  ].join("\n");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Render a DOM node to a PNG blob. Used for the styled ShareCard.
// `pixelRatio: 2` produces retina-sharp images for social platforms.
export async function nodeToPngBlob(node: HTMLElement): Promise<Blob | null> {
  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch (err) {
    console.error("[share] image generation failed", err);
    return null;
  }
}

// Web Share API with a file (image) — primary mobile path. Returns true if
// the share dialog opened. We don't treat user cancellation as an error.
export async function shareImage(
  blob: Blob,
  text: string,
  filename = "rate.png",
): Promise<"shared" | "unsupported" | "cancelled" | "error"> {
  const file = new File([blob], filename, { type: "image/png" });
  const data: ShareData_W = { files: [file], text, title: SITE_NAME };
  const navAny = navigator as Navigator & {
    canShare?: (d: ShareData_W) => boolean;
    share?: (d: ShareData_W) => Promise<void>;
  };

  if (!navAny.share || !navAny.canShare?.(data)) return "unsupported";
  try {
    await navAny.share(data);
    return "shared";
  } catch (err) {
    if ((err as Error).name === "AbortError") return "cancelled";
    return "error";
  }
}

// Web Share API for plain text (no image) — used by "Native share" option.
export async function shareText(text: string): Promise<boolean> {
  const navAny = navigator as Navigator & {
    share?: (d: { title?: string; text?: string }) => Promise<void>;
  };
  if (!navAny.share) return false;
  try {
    await navAny.share({ title: SITE_NAME, text });
    return true;
  } catch (err) {
    if ((err as Error).name === "AbortError") return true; // not a failure
    return false;
  }
}

// Last-resort: trigger a download. Used on desktop when the native share
// sheet isn't available and the user picks "Save image".
export function downloadBlob(blob: Blob, filename = "rate.png") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Internal helper — Web Share API's ShareData type isn't always available
// in TS lib settings, so we mirror the relevant subset.
type ShareData_W = {
  files?: File[];
  text?: string;
  title?: string;
};
