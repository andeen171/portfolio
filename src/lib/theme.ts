import { type FlavorName, flavors } from '@catppuccin/palette';

export const FLAVORS: readonly FlavorName[] = ['latte', 'frappe', 'macchiato', 'mocha'];

/** The flavor the server renders and the fallback when nothing is stored. */
export const DEFAULT_FLAVOR: FlavorName = 'mocha';

/** Display names, with the accents the palette's own `name` field carries. */
export const FLAVOR_NAMES = Object.fromEntries(
  FLAVORS.map((flavor) => [flavor, flavors[flavor].name])
) as Record<FlavorName, string>;

const THEME_COLORS = Object.fromEntries(
  FLAVORS.map((flavor) => [flavor, flavors[flavor].colors.base.hex])
) as Record<FlavorName, string>;

/**
 * Puts a flavor on the document: the class every `ctp-*` token resolves
 * against (on <html>, so the body background and top-layer dialogs share it)
 * and the browser chrome color. `color-scheme` follows the class in CSS.
 */
export function applyFlavor(flavor: FlavorName) {
  const root = document.documentElement;
  root.classList.remove(...FLAVORS);
  root.classList.add(flavor);

  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = THEME_COLORS[flavor];
}

/**
 * Runs in <head> before first paint: reads the flavor zustand persisted in
 * localStorage and applies it, so latte visitors never see a mocha flash.
 * Mirrors applyFlavor; it's a string because it must run before any bundle.
 */
export const themeScript = `(function(){var c=${JSON.stringify(THEME_COLORS)},f=${JSON.stringify(DEFAULT_FLAVOR)};try{var s=JSON.parse(localStorage.getItem('ctp-store')||'null');if(s&&s.state&&Object.prototype.hasOwnProperty.call(c,s.state.flavor))f=s.state.flavor}catch(e){}var r=document.documentElement;r.classList.remove.apply(r.classList,Object.keys(c));r.classList.add(f);var m=document.createElement('meta');m.name='theme-color';m.content=c[f];document.head.appendChild(m)})()`;
