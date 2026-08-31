/**
 * EpisodeBody
 *
 * Renders episode content stored as HTML (pasted in from Word/Google Docs
 * via the admin's PasteFormattedContent field, which preserves bold,
 * italic, underline, color, font, size, and paragraph alignment).
 *
 * There is no automatic "character name" / "dialogue" detection anymore —
 * that heuristic used to auto-style short standalone lines as screenplay
 * dialogue, but it collided with real formatted headings (e.g. two words in
 * all-caps meant as a title were mistaken for a character name). All
 * styling now comes directly from what was pasted in from Word — nothing
 * here overrides paragraph alignment or adds its own text-align, so a
 * paragraph left-aligned in Word stays left-aligned on the page, etc.
 *
 * GLOSSARY TERM MARKUP
 * [[Term]] or [[Term|Display Text]] anywhere in a paragraph's text is
 * resolved against the glossary lookup and rendered as a <GlossaryPopup>.
 * This scans each text node inside a paragraph (so it works even inside a
 * <strong> or colored <span>), preserving whatever formatting surrounded
 * it. Unknown terms (no matching GlossaryTerm row) degrade to plain
 * display text — never a broken popup or literal bracket text.
 *
 * Content is parsed with htmlparser2 (a direct dependency here, also used
 * internally by html-react-parser) to get a real DOM tree, then handed to
 * html-react-parser's `domToReact` with a `replace` option that expands
 * glossary markup found in text nodes into live React components.
 */

import { parseDocument } from "htmlparser2";
import { domToReact, type HTMLReactParserOptions } from "html-react-parser";
import type { ChildNode } from "domhandler";
import { isText } from "domhandler";
import type { GlossaryTermLookup } from "@/lib/data";
import GlossaryPopup from "@/components/GlossaryPopup";

const GLOSSARY_MARKUP = /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g;

/** Splits a text node's string on [[Term]]/[[Term|Display]] markup and
 * returns an array of plain strings and <GlossaryPopup> elements. */
function expandGlossaryMarkup(
  text: string,
  glossary: Record<string, GlossaryTermLookup>,
  keyPrefix: string
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  GLOSSARY_MARKUP.lastIndex = 0;
  while ((match = GLOSSARY_MARKUP.exec(text)) !== null) {
    const [fullMatch, term, displayOverride] = match;
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const displayText = displayOverride ?? term;
    const entry = glossary[term.trim().toLowerCase()];

    if (entry) {
      nodes.push(
        <GlossaryPopup
          key={`${keyPrefix}-gt-${i++}`}
          displayText={displayText}
          title={entry.title}
          definition={entry.definition}
          type={entry.type}
        />
      );
    } else {
      nodes.push(displayText);
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

interface EpisodeBodyProps {
  /** Stored HTML content (pasted from Word/Google Docs). */
  content: string;
  /** Glossary lookup keyed by normalized (lowercase) term. Pass {} if none loaded. */
  glossary?: Record<string, GlossaryTermLookup>;
}

export default function EpisodeBody({ content, glossary = {} }: EpisodeBodyProps) {
  const document = parseDocument(content);

  let textNodeKey = 0;
  const parserOptions: HTMLReactParserOptions = {
    replace: (node) => {
      if (!isText(node)) return undefined;
      if (!GLOSSARY_MARKUP.test(node.data)) return undefined;
      return <>{expandGlossaryMarkup(node.data, glossary, `tn${textNodeKey++}`)}</>;
    },
  };

  // No text-align/text-center here — alignment comes entirely from the
  // inline styles preserved on each pasted <p>, so whatever the admin set
  // in Word (left/right/center/justify) is what renders.
  return (
    <div className="flex flex-col gap-5 font-[family-name:var(--font-body)] text-lg leading-relaxed text-[var(--color-ivory)]/90 [&_p]:mb-0">
      {domToReact(document.children as ChildNode[], parserOptions)}
    </div>
  );
}
