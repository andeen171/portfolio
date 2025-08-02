import { useLanguageStore } from '@/store/language';
import { getLocalizedValue } from '@/utils/localization';
import { SanityDocument } from 'next-sanity';
import { useEffect, useRef } from 'react';

interface SkillItemProps {
  skill: SanityDocument;
}

const SkillItem: React.FC<SkillItemProps> = ({ skill }) => {
  const language = useLanguageStore((state) => state.language);
  const description = getLocalizedValue(skill.description, language);
  const svgRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (svgRef.current) {
      const svgElement = svgRef.current.querySelector('svg');
      if (svgElement) {
        // Aplicar classes CSS para gradientes
        svgElement.classList.add('skill-icon-gradient');

        // Ou aplicar fill com gradiente CSS
        const paths = svgElement.querySelectorAll('path, circle, rect, polygon');
        // biome-ignore lint/complexity/noForEach: <explanation>
        paths.forEach((path) => {
          path.setAttribute('fill', 'url(#skillGradient)');
        });
      }
    }
  }, [skill.svgCode]);

  return (
    <div className="group relative flex flex-col items-center justify-center rounded-xl bg-ctp-mantle p-4 shadow-xl transition hover:shadow-lg hover:bg-ctp-mantle/80">
      {/* Definir gradiente SVG inline */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <title>Gradient</title>
        <defs>
          <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--ctp-teal))" />
            <stop offset="50%" stopColor="rgb(var(--ctp-lavender))" />
            <stop offset="100%" stopColor="rgb(var(--ctp-pink))" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tooltip */}
      <div
        className="absolute z-10 w-64 px-4 py-2 text-sm text-ctp-text bg-ctp-surface0 rounded-lg shadow-lg
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                    -translate-y-full -top-2 left-1/2 -translate-x-1/2 before:content-[''] before:absolute before:left-1/2
                    before:-translate-x-1/2 before:bottom-[-0.5rem] before:border-8 before:border-x-transparent
                    before:border-b-transparent before:border-t-ctp-surface0"
      >
        {description}
      </div>

      {/* Ícone da habilidade */}
      <div className="flex h-16 w-16 items-center justify-center mb-3">
        <div
          ref={svgRef}
          className="h-full w-full flex items-center justify-center skill-svg-container"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanity content
          dangerouslySetInnerHTML={{ __html: skill.svgCode }}
        />
      </div>

      <span className="animated-gradient-text text-lg font-semibold">{skill.name}</span>
    </div>
  );
};

export default SkillItem;
