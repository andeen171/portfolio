import CatppuccinGlareCard from '@/components/GlareCard';
import { useLanguageStore } from '@/store/language';
import { getLocalizedValue } from '@/utils/localization';
import { SanityDocument } from 'next-sanity';

interface SkillItemProps {
  skill: SanityDocument;
}

const SkillItem: React.FC<SkillItemProps> = ({ skill }) => {
  const language = useLanguageStore((state) => state.language);
  const description = getLocalizedValue(skill.description, language);

  return (
    <>
      <div className="group relative flex justify-center">
        <div className="cursor-pointer transform transition-transform hover:scale-105">
          {/* Tooltip - only show when not expanded */}
          <div
            className="absolute z-20 w-64 px-4 py-2 text-sm text-ctp-text bg-ctp-mantle rounded-lg shadow-lg
                            opacity-0 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none
                            -translate-y-full -top-4 left-1/2 -translate-x-1/2 before:content-[''] before:absolute before:left-1/2
                            before:-translate-x-1/2 before:bottom-[-0.5rem] before:border-8 before:border-x-transparent
                            before:border-b-transparent before:border-t-ctp-surface0"
          >
            {description}
          </div>
          <CatppuccinGlareCard>
            <div className="flex flex-col items-center justify-center h-full p-12 relative">
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

              {/* Ícone da habilidade */}
              <div className="flex h-20 w-20 items-center justify-center mb-4">
                <div
                  className="h-full w-full flex items-center justify-center skill-svg-container"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanity content
                  dangerouslySetInnerHTML={{ __html: skill.svgCode }}
                />
              </div>

              <span className="animated-gradient-text text-lg font-semibold text-center leading-tight">
                {skill.name}
              </span>
            </div>
          </CatppuccinGlareCard>
        </div>
      </div>
    </>
  );
};

export default SkillItem;
