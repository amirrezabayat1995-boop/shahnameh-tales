"use client";

import { useRef, useState } from "react";

interface PasteFormattedContentProps {
  name: string; // hidden input name so it submits with the surrounding <form>
  initialContent?: string; // stored HTML
}

const ALLOWED_TAGS = new Set(["P", "STRONG", "B", "EM", "I", "U", "SPAN", "BR", "DIV"]);

// Word's own baseline body color is near-black. Anything within this
// tolerance of pure black is treated as "no color set" rather than an
// intentional choice, so the site's default (ivory) text color applies
// instead of overriding it with black-on-lapis.
function isEffectivelyDefaultBlack(rgb: string): boolean {
  const match = rgb.match(/\d+/g);
  if (!match) return true;
  const [r, g, b] = match.map(Number);
  // Word's default text is usually exactly rgb(0,0,0) or very close to it
  // (e.g. windowtext resolves to 0,0,0). A small tolerance covers rounding.
  return r <= 20 && g <= 20 && b <= 20;
}

const ALIGN_VALUES = new Set(["left", "right", "center", "justify"]);

/**
 * Reads text-align the way it was *actually authored*, not just whatever
 * the browser's computed style resolves to (which is always some value,
 * defaulting to "left" even when nothing was ever set). We only trust:
 *   1. An inline style directly on the element (style="text-align: ...")
 *   2. A CSS rule from Word's own <style> block that explicitly targets
 *      this element's class and sets text-align (e.g. p.MsoNormal)
 * If neither exists, we return null and no alignment is carried over —
 * letting the page's own default (or dir-based default) apply.
 */
function getExplicitTextAlign(
  el: HTMLElement,
  iframeDoc: Document
): string | null {
  // 1. Inline style always wins and is unambiguous.
  const inline = el.style.textAlign;
  if (inline && ALIGN_VALUES.has(inline)) return inline;

  // 2. Look for a matching rule in the document's stylesheets that
  // explicitly declares text-align for a class this element has.
  const classList = Array.from(el.classList);
  if (classList.length === 0) return null;

  try {
    for (const sheet of Array.from(iframeDoc.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin or inaccessible stylesheet
      }
      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule)) continue;
        const align = rule.style.textAlign;
        if (!align || !ALIGN_VALUES.has(align)) continue;
        // Does this rule's selector match one of the element's classes?
        // Word style rules are typically simple, e.g. "p.MsoNormal" or
        // ".MsoNormal" — checking selectorText for the class name is
        // reliable enough for Word's own clipboard output.
        const matchesClass = classList.some((c) => rule.selectorText.includes(c));
        if (matchesClass) return align;
      }
    }
  } catch {
    // If stylesheet inspection fails for any reason, fall through to null
    // rather than guessing from computed style.
  }

  return null;
}

// A small allow-list of generic font families we're happy to carry over.
// Word/Google Docs font names come through mostly clean, but we still trim
// and drop obviously broken values (empty strings, "inherit", etc).
function cleanFontFamily(fontFamily: string | undefined): string | null {
  if (!fontFamily) return null;
  const first = fontFamily.split(",")[0]?.trim().replace(/^["']|["']$/g, "");
  if (!first) return null;
  if (["inherit", "initial", "unset", "normal"].includes(first.toLowerCase())) return null;
  return first;
}

/**
 * Sanitizes HTML pasted from Word/Google Docs down to plain, clean markup,
 * while preserving the formatting that actually matters: bold, italic,
 * underline, color, font family, font size, and paragraph alignment.
 *
 * Word doesn't put alignment (or sometimes color) directly on each <p> as
 * an inline style — it defines rules in a <style> block in the clipboard's
 * <head> (e.g. `p.MsoNormal { ... }`) and each <p> just references that
 * class. A detached <div> can't resolve CSS classes/stylesheets, so we
 * load the *entire* clipboard HTML (head, style block, and all) into a
 * hidden <iframe> that's actually attached to the document, so the
 * browser parses and applies Word's <style> rules like any other page.
 *
 * IMPORTANT: we do NOT blindly trust getComputedStyle() for color or
 * alignment, because computed style always resolves to *some* value (e.g.
 * "left" or "rgb(0,0,0)") even when nothing was ever explicitly set —
 * that was the source of two bugs: default-black text overriding the
 * site's default ivory color, and default-left computed alignment
 * overriding the page's own default/RTL behavior. See
 * getExplicitTextAlign() and isEffectivelyDefaultBlack() above.
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

      const isBlock = el.tagName === "P" || el.tagName === "DIV";
      const isInlineFormatting = ["STRONG", "B", "EM", "I", "U", "SPAN"].includes(
        el.tagName
      );

      if (isBlock) {
        const p = document.createElement("p");
        const declarations: string[] = [];

        // Only carry alignment over if it was explicitly authored —
        // never fall back to whatever the browser's default resolves to.
        const explicitAlign = getExplicitTextAlign(el, iframeDoc);
        if (explicitAlign) declarations.push(`text-align: ${explicitAlign}`);

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
        const computed = iframeDoc.defaultView?.getComputedStyle(el);

        if (computed) {
          const weight = parseInt(computed.fontWeight || "400", 10);
          if (weight >= 600) declarations.push("font-weight: bold");

          if (computed.fontStyle === "italic") declarations.push("font-style: italic");

          if (computed.textDecorationLine?.includes("underline")) {
            declarations.push("text-decoration: underline");
          }

          // Only carry color over if it isn't just Word's default
          // near-black body text — otherwise it overrides the site's
          // default (ivory) color and makes text unreadable on a dark
          // background.
          if (computed.color && !isEffectivelyDefaultBlack(computed.color)) {
            declarations.push(`color: ${computed.color}`);
          }

          const fontSizePx = parseFloat(computed.fontSize || "0");
          if (fontSizePx > 0) declarations.push(`font-size: ${Math.round(fontSizePx)}px`);

          const fontFamily = cleanFontFamily(computed.fontFamily);
          if (fontFamily) declarations.push(`font-family: '${fontFamily}'`);
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
