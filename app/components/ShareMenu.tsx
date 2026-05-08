"use client";

import { useEffect, useRef, useState } from "react";
import {
  Share2,
  Copy,
  Image as ImageIcon,
  Send,
  Check,
  Loader2,
} from "lucide-react";
import {
  buildShareText,
  copyText,
  downloadBlob,
  nodeToPngBlob,
  shareImage,
  shareText,
  type ShareData,
} from "@/app/lib/share";
import { ShareCard } from "./ShareCard";

type Status = "idle" | "loading" | "copied" | "shared" | "saved" | "error";

export function ShareMenu({
  data,
  fromFlag,
  toFlag,
}: {
  data: ShareData;
  fromFlag: string;
  toFlag: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const cardRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Feature-detect Web Share API after mount (avoids SSR mismatch).
  const [canShareNative, setCanShareNative] = useState(false);
  useEffect(() => {
    setCanShareNative(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Click-outside + escape close
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Auto-clear feedback states after 2s
  useEffect(() => {
    if (status === "idle" || status === "loading") return;
    const t = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(t);
  }, [status]);

  const text = buildShareText(data);

  async function onCopyText() {
    setStatus("loading");
    const ok = await copyText(text);
    setStatus(ok ? "copied" : "error");
    setOpen(false);
  }

  async function onShareImage() {
    if (!cardRef.current) return;
    setStatus("loading");
    const blob = await nodeToPngBlob(cardRef.current);
    if (!blob) {
      setStatus("error");
      return;
    }
    const filename = `${data.fromCode}-${data.toCode}-${Date.now()}.png`;
    const result = await shareImage(blob, text, filename);
    if (result === "shared") {
      setStatus("shared");
    } else if (result === "cancelled") {
      setStatus("idle");
    } else {
      // Web Share API not available or failed — download instead.
      downloadBlob(blob, filename);
      setStatus("saved");
    }
    setOpen(false);
  }

  async function onNativeShare() {
    setStatus("loading");
    const ok = await shareText(text);
    setStatus(ok ? "shared" : "error");
    setOpen(false);
  }

  // Quick affordance for the button label/icon based on status
  const iconByStatus = {
    idle: <Share2 size={14} />,
    loading: <Loader2 size={14} className="animate-spin" />,
    copied: <Check size={14} className="text-emerald-500" />,
    shared: <Check size={14} className="text-emerald-500" />,
    saved: <Check size={14} className="text-emerald-500" />,
    error: <Share2 size={14} className="text-rose-500" />,
  };
  const labelByStatus = {
    idle: "Share",
    loading: "Working…",
    copied: "Text copied",
    shared: "Shared",
    saved: "Image saved",
    error: "Failed — retry",
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 text-[11px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {iconByStatus[status]}
        {labelByStatus[status]}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <MenuItem icon={<Copy size={14} />} onClick={onCopyText}>
            Copy as text
          </MenuItem>
          <MenuItem icon={<ImageIcon size={14} />} onClick={onShareImage}>
            {canShareNative ? "Share image" : "Save image"}
          </MenuItem>
          {canShareNative && (
            <MenuItem icon={<Send size={14} />} onClick={onNativeShare}>
              Native share…
            </MenuItem>
          )}
        </div>
      )}

      {/* Offscreen render of the share card so html-to-image can capture it.
          Position must be in the document (not display:none) for getComputedStyle
          to work — left:-9999px is the standard offscreen pattern. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: -10000,
          top: 0,
          pointerEvents: "none",
        }}
      >
        <ShareCard ref={cardRef} {...data} fromFlag={fromFlag} toFlag={toFlag} />
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
      {children}
    </button>
  );
}
