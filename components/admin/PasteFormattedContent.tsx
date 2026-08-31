"use client";

import { useRef, useState } from "react";

interface PasteFormattedContentProps {
  name: string; // hidden input name so it submits with the surrounding <form>
  initialContent?: string; // stored HTML
}

const ALLOWED_TAGS = new Set(["P", "STRONG", "B", "EM", "I", "U", "SPAN", "BR", "DIV"]);

/**
 * Sanitizes HTML pasted from Word/Google Docs down to plain, clean markup,
 * while preserving the formatting that actually matters: bold, italic,
 * underline, color, font family, font size, and paragraph alignment.
 *
 * The tricky part: Word doesn't put alignment directly on each <p> as an
 * inline style. It defines rules in a <style> block in the clipboard's
 * <head> (e.g. `p.MsoNormal { ... }` or a per-paragraph class with
 * `text-align: center`), and each <p> just references that class. A
 * detached <div> can't resolve CSS classes/stylesheets, so reading
 * `element.style` alone (inline styles only) misses anything Word
 * expressed through its stylesheet rather than inline.
 *
 * To resolve this correctly, we load the *entire* clipboard HTML (head,
 * style block, and all) into a hidden <iframe> that's actually attached to
 * the document. Once attached, the browser parses and applies Word's
 * <style> rules like any other page, so `getComputedStyle()` on each
 * paragraph gives us the real, resolved alignment/formatting — regardless
 * of whether Word expressed it inline or via a class. We then rebuild a
 * clean, minimal HTML tree from those computed values and discard
 * everything else (the mso-* markup, the style block itself, Word's
 * classes, XML namespaces, etc.).
 */
function sanitizePastedHtml(dirtyHtml: string): string {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return fallbackStrip(dirtyHtml);

    iframeDoc.open();
    iframeDoc.write(dirtyHtml);
    iframeDoc.close();

    const sourceBody = iframeDoc.body;
    if (!sourceBody) return fallbackStrip(dirtyHtml);

    const output = document.createElement("div");

    function convert(node: Node): Node | Node[] | null {
      if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent ?? "");
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return null;
      const el = node as HTMLElement;

      // Word wraps content in <o:p> (empty paragraph markers) and various
      // XML-namespaced tags — skip anything not a real HTML element we
      // recognize, but still walk into it in case it wraps real content.
      const computed = iframeDoc.defaultView?.getComputedStyle(el);

      const isBlock = el.tagName === "P" || el.tagName === "DIV";
      const isInlineFormatting = ["STRONG", "B", "EM", "I", "U", "SPAN"].includes(
        el.tagName
      );

      if (isBlock) {
        const p = document.createElement("p");
        const declarations: string[] = [];

        const textAlign = computed?.textAlign;
        if (textAlign && ["left", "right", "center", "justify"].includes(textAlign)) {
          declarations.push(`text-align: ${textAlign}`);
        }

        if (declarations.length > 0) p.setAttribute("style", declarations.join("; "));

        Array.from(el.childNodes).forEach((child) => {
          const converted = convert(child);
          if (!converted) return;
          if (Array.isArray(converted)) converted.forEach((c) => p.appendChild(c));
          else p.appendChild(converted);
        });

        return p;
      }

      if (isInlineFormatting || el.tagName === "SPAN") {
        const declarations: string[] = [];

        if (computed) {
          const weight = parseInt(computed.fontWeight || "400", 10);
          if (weight >= 600) declarations.push("font-weight: bold");

          if (computed.fontStyle === "italic") declarations.push("font-style: italic");

          if (computed.textDecorationLine?.includes("underline")) {
            declarations.push("text-decoration: underline");
          }

          if (computed.color) declarations.push(`color: ${computed.color}`);

          const fontSizePx = parseFloat(computed.fontSize || "0");
          if (fontSizePx > 0) declarations.push(`font-size: ${Math.round(fontSizePx)}px`);
        }

        const span = document.createElement("span");
        if (declarations.length > 0) span.setAttribute("style", declarations.join("; "));

        const children: Node[] = [];
        Array.from(el.childNodes).forEach((child) => {
          const converted = convert(child);
          if (!converted) return;
          if (Array.isArray(converted)) children.push(...converted);
          else children.push(converted);
        });
        children.forEach((c) => span.appendChild(c));

        // If nothing meaningful was captured, don't bother wrapping in an
        // empty <span> — just return its children directly.
        if (declarations.length === 0) return children;
        return span;
      }

      if (el.tagName === "BR") return document.createElement("br");

      // Anything else (Word's <o:p>, style/meta/link tags, etc.) — skip the
      // tag but keep walking its children in case there's real text inside.
      const passthrough: Node[] = [];
      Array.from(el.childNodes).forEach((child) => {
        const converted = convert(child);
        if (!converted) return;
        if (Array.isArray(converted)) passthrough.push(...converted);
        else passthrough.push(converted);
      });
      return passthrough;
    }

    Array.from(sourceBody.childNodes).forEach((child) => {
      const converted = convert(child);
      if (!converted) return;
      if (Array.isArray(converted)) converted.forEach((c) => output.appendChild(c));
      else output.appendChild(converted);
    });

    // Word sometimes leaves fully empty paragraphs between real ones.
    output.querySelectorAll("p").forEach((p) => {
      if (!p.textContent?.trim() && p.children.length === 0) p.remove();
    });

    return output.innerHTML;
  } finally {
    document.body.removeChild(iframe);
  }
}

/** Last-resort fallback (e.g. iframe blocked) — strips tags/attributes
 * without resolving class-based styles, so bold/color from inline styles
 * still work but class-based alignment won't. */
function fallbackStrip(dirtyHtml: string): string {
  const container = document.createElement("div");
  container.innerHTML = dirtyHtml;

  function cleanElement(el: Element) {
    Array.from(el.children).forEach(cleanElement);
    if (!ALLOWED_TAGS.has(el.tagName)) {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }
      return;
    }
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name !== "style") el.removeAttribute(attr.name);
    });
  }

  Array.from(container.children).forEach(cleanElement);
  return container.innerHTML;
}

export default function PasteFormattedContent({
  name,
  initialContent = "",
}: PasteFormattedContentProps) {
  const editableRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(initialContent);

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const rawHtml = e.clipboardData.getData("text/html");
    const rawText = e.clipboardData.getData("text/plain");

    let toInsert: string;
    if (rawHtml) {
      toInsert = sanitizePastedHtml(rawHtml);
    } else {
      toInsert = rawText
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => `<p>${line}</p>`)
        .join("");
    }

    document.execCommand("insertHTML", false, toInsert);
    if (editableRef.current) setHtml(editableRef.current.innerHTML);
  }

  function handleInput() {
    if (editableRef.current) setHtml(editableRef.current.innerHTML);
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={html} suppressHydrationWarning />

      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        suppressHydrationWarning
        onPaste={handlePaste}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: initialContent }}
        className="min-h-[300px] rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-3 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none [&_p]:mb-4 [&_p:last-child]:mb-0"
      />

      <p className="font-[family-name:var(--font-ui)] text-xs text-[var(--color-ivory)]/40">
        Write and format your episode in Word (or Google Docs), then copy and
        paste it here — bold, italic, underline, color, font, size, and
        paragraph alignment all carry over automatically. To link a glossary
        term, type <code className="rounded-sm bg-black/30 px-1">[[Term]]</code>{" "}
        around it (e.g.{" "}
        <code className="rounded-sm bg-black/30 px-1">[[Rakhsh]]</code>).
      </p>
    </div>
  );
}
