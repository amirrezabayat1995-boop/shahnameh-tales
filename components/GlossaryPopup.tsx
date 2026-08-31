"use client";

import { useEffect, useId, useRef, useState } from "react";

interface GlossaryPopupProps {
  /** The text to display inline (may differ from the term key, e.g. [[Rostam|the hero]]). */
  displayText: string;
  title: string;
  definition: string;
  type: "CHARACTER" | "PLACE" | "TERM";
}

const TYPE_LABEL: Record<GlossaryPopupProps["type"], string> = {
  CHARACTER: "Character",
  PLACE: "Place",
  TERM: "Term",
};

export default function GlossaryPopup({
  displayText,
  title,
  definition,
  type,
}: GlossaryPopupProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const popupId = useId();

  // Close on outside click (covers the click-to-open case on both touch
  // and desktop) and on Escape.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        aria-describedby={open ? popupId : undefined}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="cursor-help border-b border-dotted border-[var(--color-gold)] text-[var(--color-gold-bright)] transition-colors hover:text-[var(--color-gold)] focus-visible:outline-none"
      >
        {displayText}
      </button>

      {open && (
        <span
          id={popupId}
          role="tooltip"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-sm border border-[var(--color-gold)]/40 bg-[var(--color-ink-deep)] p-4 text-left shadow-lg"
        >
          <span className="mb-1 flex items-center justify-between gap-2">
            <span className="font-[family-name:var(--font-display)] text-base font-semibold not-italic text-[var(--color-gold-bright)]">
              {title}
            </span>
            <span className="shrink-0 font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.15em] text-[var(--color-ivory)]/40">
              {TYPE_LABEL[type]}
            </span>
          </span>
          <span className="block font-[family-name:var(--font-body)] text-sm not-italic leading-relaxed text-[var(--color-ivory)]/85">
            {definition}
          </span>
          {/* Little pointer/arrow */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-full -mt-px h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-[var(--color-gold)]/40 bg-[var(--color-ink-deep)]"
          />
        </span>
      )}
    </span>
  );
}
