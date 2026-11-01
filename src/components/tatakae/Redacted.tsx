'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * A blacked-out phrase. Hover peeks at it, a click or tap keeps it
 * declassified. The words are always in the DOM, so screen readers read them
 * as plain text inside the button.
 */
export default function Redacted({ children, label }: { children: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={open}
      title={label}
      onClick={() => setOpen((value) => !value)}
      className={cn(
        'cursor-pointer rounded-[3px] px-1 box-decoration-clone transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ctp-red motion-reduce:transition-none',
        open
          ? 'bg-ctp-red/15 text-ctp-text'
          : 'redaction-bar text-transparent selection:text-transparent hover:bg-none hover:bg-ctp-red/15 hover:text-ctp-text hover:shadow-none'
      )}
    >
      {children}
    </button>
  );
}

/** A paragraph with its `[[words]]` blacked out. */
export function RedactedText({ text, label }: { text: string; label: string }) {
  return text.split(/\[\[([^\]]+)\]\]/).map((part, index) =>
    index % 2 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: a fixed split of one string
      <Redacted key={index} label={label}>
        {part}
      </Redacted>
    ) : (
      part
    )
  );
}
