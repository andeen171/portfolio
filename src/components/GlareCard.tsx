import { cn } from '@/lib/utils';
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
  } as any;

  const backgroundStyle = {
    '--step': '5%',
    '--foil-svg': `url("data:image/svg+xml,%3Csvg width='26' height='26' viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.99994 3.419C2.99994 3.419 21.6142 7.43646 22.7921 12.153C23.97 16.8695 3.41838 23.0306 3.41838 23.0306' stroke='white' stroke-width='3' stroke-miterlimit='3.86874' stroke-linecap='round' style='mix-blend-mode:darken'/%3E%3C/svg%3E")`,
    '--pattern': 'var(--foil-svg) center/100% no-repeat',
    '--catppuccin-rainbow':
      'repeating-linear-gradient( 45deg, rgb(var(--ctp-teal)) calc(var(--step) * 1), rgb(var(--ctp-sky)) calc(var(--step) * 2), rgb(var(--ctp-sapphire)) calc(var(--step) * 3), rgb(var(--ctp-blue)) calc(var(--step) * 4), rgb(var(--ctp-lavender)) calc(var(--step) * 5), rgb(var(--ctp-pink)) calc(var(--step) * 6), rgb(var(--ctp-mauve)) calc(var(--step) * 7) ) 0% var(--bg-y)/200% 700% no-repeat',
    '--diagonal':
      'repeating-linear-gradient( 128deg, rgb(var(--ctp-crust)) 0%, rgb(var(--ctp-surface0)) 3.8%, rgb(var(--ctp-surface1)) 4.5%, rgb(var(--ctp-surface2)) 5.2%, rgb(var(--ctp-mantle)) 10%, rgb(var(--ctp-base)) 12% ) var(--bg-x) var(--bg-y)/300% no-repeat',
    '--shade':
      'radial-gradient( farthest-corner circle at var(--m-x) var(--m-y), rgba(var(--ctp-text), 0.1) 12%, rgba(var(--ctp-text), 0.15) 20%, rgba(var(--ctp-text), 0.25) 120% ) var(--bg-x) var(--bg-y)/300% no-repeat',
    backgroundBlendMode: 'hue, hue, hue, overlay',
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
      <div className="h-full grid will-change-transform origin-center transition-transform duration-[var(--duration)] ease-[var(--easing)] [transform:rotateY(var(--r-x))_rotateX(var(--r-y))] rounded-[var(--radius)] border border-ctp-surface0 hover:[--opacity:0.8] hover:[--duration:200ms] hover:[--easing:linear] overflow-hidden shadow-lg">
        <div className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light [clip-path:inset(0_0_0_0_round_var(--radius))]">
          <div className={cn('h-full w-full bg-ctp-mantle', className)}>{children}</div>
        </div>
        <div className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light [clip-path:inset(0_0_1px_0_round_var(--radius))] opacity-[var(--opacity)] transition-opacity duration-[var(--duration)] ease-[var(--easing)] will-change-background [background:radial-gradient(farthest-corner_circle_at_var(--m-x)_var(--m-y),_rgba(var(--ctp-lavender),0.8)_10%,_rgba(var(--ctp-teal),0.65)_20%,_rgba(var(--ctp-pink),0)_90%)]" />
        <div
          className="w-full h-full grid [grid-area:1/1] mix-blend-color-dodge opacity-[var(--opacity)] will-change-background transition-opacity [clip-path:inset(0_0_1px_0_round_var(--radius))] [background-blend-mode:hue_hue_hue_overlay] [background:var(--pattern),_var(--catppuccin-rainbow),_var(--diagonal),_var(--shade)] relative after:content-[''] after:grid-area-[inherit] after:bg-repeat-[inherit] after:bg-attachment-[inherit] after:bg-origin-[inherit] after:bg-clip-[inherit] after:bg-[inherit] after:mix-blend-exclusion after:[background-size:var(--foil-size),_200%_400%,_800%,_200%] after:[background-position:center,_0%_var(--bg-y),_calc(var(--bg-x)*_-1)_calc(var(--bg-y)*_-1),_var(--bg-x)_var(--bg-y)] after:[background-blend-mode:soft-light,_hue,_hard-light]"
          style={{ ...backgroundStyle }}
        />
      </div>
    </div>
  );
};

export default GlareCard;
