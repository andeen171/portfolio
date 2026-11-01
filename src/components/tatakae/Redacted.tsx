import { useTranslations } from 'next-intl';

/**
 * A line of dossier text with its censor tape. `[[words]]` are taped over
 * and only show while the pointer rests on them (nothing keeps them open);
 * `[[#18]]` is a permanent bar 18 characters wide with nothing behind it,
 * for what never leaves the file (a registry number, the company's size).
 * Screen readers read peekable words as plain text and hear "redacted" for
 * the permanent bars.
 */
export function RedactedText({ text }: { text: string }) {
  const t = useTranslations('tatakae');
  return text.split(/\[\[([^\]]+)\]\]/).map((part, index) => {
    if (index % 2 === 0) return part;
    const sealed = /^#(\d{1,2})$/.exec(part);
    if (sealed) {
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed split of one string
        <span key={index}>
          <span
            aria-hidden="true"
            className="redaction-bar inline-block h-[1.05em] max-w-full translate-y-[0.15em] rounded-[2px]"
            style={{ width: `${Math.max(2, Number(sealed[1]))}ch` }}
          />
          <span className="sr-only">{t('censored')}</span>
        </span>
      );
    }
    return (
      <span
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed split of one string
        key={index}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: focus lifts the tape like hover does, so keyboard users can read it too
        tabIndex={0}
        title={t('redacted')}
        className="redaction-bar cursor-help rounded-[2px] px-0.5 text-transparent box-decoration-clone transition-colors duration-200 select-none hover:bg-none hover:bg-ctp-red/15 hover:text-ctp-text hover:shadow-none focus-visible:bg-none focus-visible:bg-ctp-red/15 focus-visible:text-ctp-text focus-visible:shadow-none focus-visible:outline-1 focus-visible:outline-ctp-red motion-reduce:transition-none"
      >
        {part}
      </span>
    );
  });
}
