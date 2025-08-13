import { cn } from '@/lib/utils';
import { Properties } from 'csstype';
import { useRef } from 'react';

export const GlareCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const isPointerInside = useRef(false);
  const refElement = useRef<HTMLDivElement>(null);
  const state = useRef({
    glare: {
      x: 50,
      y: 50,
    },
    background: {
      x: 50,
      y: 50,
    },
    rotate: {
      x: 0,
      y: 0,
    },
  });

  const containerStyle = {
    '--m-x': '50%',
    '--m-y': '50%',
    '--r-x': '0deg',
    '--r-y': '0deg',
    '--bg-x': '50%',
    '--bg-y': '50%',
    '--duration': '300ms',
    '--foil-size': '100%',
    '--opacity': '0',
    '--radius': '16px',
    '--easing': 'ease',
    '--transition': 'var(--duration) var(--easing)',
  } as Properties<string | number>;

  const backgroundStyle = {
    '--step': '4%',
    '--subtle-pattern': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23cba6f7' fill-opacity='0.1'/%3E%3C/svg%3E")`,
    '--pattern': 'var(--subtle-pattern) center/80px 80px repeat',
    '--catppuccin-rainbow':
      'repeating-linear-gradient( 45deg, rgba(var(--ctp-teal), 0.8) calc(var(--step) * 1), rgba(var(--ctp-sky), 0.7) calc(var(--step) * 2), rgba(var(--ctp-sapphire), 0.8) calc(var(--step) * 3), rgba(var(--ctp-blue), 0.7) calc(var(--step) * 4), rgba(var(--ctp-lavender), 0.9) calc(var(--step) * 5), rgba(var(--ctp-pink), 0.8) calc(var(--step) * 6), rgba(var(--ctp-mauve), 0.7) calc(var(--step) * 7) ) 0% var(--bg-y)/200% 600% no-repeat',
    '--diagonal':
      'repeating-linear-gradient( 135deg, rgba(var(--ctp-surface0), 0.4) 0%, rgba(var(--ctp-surface1), 0.6) 2px, rgba(var(--ctp-surface0), 0.4) 4px, rgba(var(--ctp-mantle), 0.3) 8px ) var(--bg-x) var(--bg-y)/150% 150% no-repeat',
    '--shine':
      'linear-gradient( 45deg, transparent 30%, rgba(var(--ctp-lavender), 0.1) 50%, transparent 70% ) var(--bg-x) var(--bg-y)/200% 200% no-repeat',
    backgroundBlendMode: 'soft-light, hue, multiply, overlay',
  };

  const updateStyles = () => {
    if (refElement.current) {
      const { background, rotate, glare } = state.current;
      refElement.current?.style.setProperty('--m-x', `${glare.x}%`);
      refElement.current?.style.setProperty('--m-y', `${glare.y}%`);
      refElement.current?.style.setProperty('--r-x', `${rotate.x}deg`);
      refElement.current?.style.setProperty('--r-y', `${rotate.y}deg`);
      refElement.current?.style.setProperty('--bg-x', `${background.x}%`);
      refElement.current?.style.setProperty('--bg-y', `${background.y}%`);
    }
  };

  return (
    <div
      style={containerStyle}
      className="relative isolate [contain:layout_style] [perspective:600px] transition-transform duration-[var(--duration)] ease-[var(--easing)] will-change-transform w-full aspect-[4/5] max-w-[280px]"
      ref={refElement}
      onPointerMove={(event) => {
        const rotateFactor = 0.3;
        const rect = event.currentTarget.getBoundingClientRect();
        const position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const percentage = {
          x: (100 / rect.width) * position.x,
          y: (100 / rect.height) * position.y,
        };
        const delta = {
          x: percentage.x - 50,
          y: percentage.y - 50,
        };

        const { background, rotate, glare } = state.current;
        background.x = 50 + percentage.x / 4 - 12.5;
        background.y = 50 + percentage.y / 3 - 16.67;
        rotate.x = -(delta.x / 3.5);
        rotate.y = delta.y / 2;
        rotate.x *= rotateFactor;
        rotate.y *= rotateFactor;
        glare.x = percentage.x;
        glare.y = percentage.y;

        updateStyles();
      }}
      onPointerEnter={() => {
        isPointerInside.current = true;
        if (refElement.current) {
          setTimeout(() => {
            if (isPointerInside.current) {
              refElement.current?.style.setProperty('--duration', '0s');
            }
          }, 300);
        }
      }}
      onPointerLeave={() => {
        isPointerInside.current = false;
        if (refElement.current) {
          refElement.current.style.removeProperty('--duration');
          refElement.current?.style.setProperty('--r-x', '0deg');
          refElement.current?.style.setProperty('--r-y', '0deg');
        }
      }}
    >
      <div className="h-full grid will-change-transform origin-center transition-transform duration-[var(--duration)] ease-[var(--easing)] [transform:rotateY(var(--r-x))_rotateX(var(--r-y))] rounded-[var(--radius)] border border-ctp-surface0 hover:[--opacity:0.9] hover:[--duration:150ms] hover:[--easing:linear] overflow-hidden shadow-lg">
        <div className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light [clip-path:inset(0_0_0_0_round_var(--radius))]">
          <div className={cn('h-full w-full bg-ctp-mantle', className)}>{children}</div>
        </div>
        <div className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light [clip-path:inset(0_0_1px_0_round_var(--radius))] opacity-[var(--opacity)] transition-opacity duration-[var(--duration)] ease-[var(--easing)] will-change-background [background:radial-gradient(farthest-corner_circle_at_var(--m-x)_var(--m-y),_rgba(203,166,247,0.9)_5%,_rgba(148,226,213,0.7)_15%,_rgba(245,194,231,0.5)_30%,_rgba(137,220,235,0.3)_50%,_transparent_90%)]" />
        <div
          className="w-full h-full grid [grid-area:1/1] mix-blend-color-dodge opacity-[var(--opacity)] will-change-background transition-opacity [clip-path:inset(0_0_1px_0_round_var(--radius))] relative after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-transparent after:mix-blend-overlay"
          style={{
            background: 'var(--catppuccin-rainbow), var(--diagonal), var(--shine)',
            backgroundSize: '200% 600%, 150% 150%, 200% 200%',
            backgroundPosition: '0% var(--bg-y), var(--bg-x) var(--bg-y), var(--bg-x) var(--bg-y)',
            ...backgroundStyle,
          }}
        />
      </div>
    </div>
  );
};

export default GlareCard;
