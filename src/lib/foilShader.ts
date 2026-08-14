/**
 * Shared WebGL foil renderer.
 *
 * A skills grid renders 66 cards, and browsers cap live WebGL contexts at
 * roughly 16 — one context per card is not an option. Instead the whole page
 * shares a *single* context, used two ways:
 *
 * - **At rest**, {@link renderFoilTexture} draws one frame for a given seed and
 *   hands back a data URL, which the card paints as an ordinary CSS background.
 *   Memoised per seed, so a card costs one draw call for its whole lifetime.
 * - **On hover**, {@link acquireLiveCanvas} moves the shared canvas into the
 *   hovered card and animates it. Only one card can be hovered at a time, so
 *   one context is genuinely enough.
 *
 * Because both paths run the same program, the swap between the static frame
 * and the live canvas is visually continuous.
 *
 * Everything here is browser-only and must not be imported during SSR.
 */

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/**
 * Thin-film interference over a warped noise surface.
 *
 * The film thickness is a domain-warped fBm, so the iridescent bands break up
 * into the irregular "cloudy" structure of real foil stock rather than the even
 * sweep a plain gradient gives. Interference colour comes from evaluating the
 * optical path difference at three offset phases (a cheap RGB stand-in for a
 * full spectral integral).
 */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_pointer;    // 0..1, card-local pointer position
uniform float u_seed;       // per-skill, keeps two cards from matching
uniform vec3  u_tint;       // logo/accent colour the foil is biased toward
uniform float u_light;      // 1.0 on the latte flavor
uniform float u_intensity;

out vec4 outColor;

// -- value noise + fBm ------------------------------------------------------

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123) * 2.0 - 1.0;
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    total += noise(p) * amplitude;
    p *= 2.02;
    amplitude *= 0.5;
  }
  return total;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  // Correct for the window's aspect so the grain isn't stretched.
  vec2 p = uv * vec2(u_resolution.x / u_resolution.y, 1.0);

  float seed = u_seed * 17.0;
  vec2 drift = vec2(u_time * 0.05, u_time * -0.03);

  // Domain warp: noise sampling noise, which gives the swirled foil grain.
  vec2 warp = vec2(
    fbm(p * 3.0 + seed + drift),
    fbm(p * 3.0 + seed + 5.2 - drift)
  );
  float thickness = fbm(p * 4.5 + warp * 1.8 + seed);

  // Light direction follows the pointer; at rest it sits slightly off-centre so
  // the static frame still reads as lit rather than flat.
  vec2 toLight = (u_pointer - uv);
  float lightDist = length(toLight);
  float incidence = 1.0 - clamp(lightDist * 1.3, 0.0, 1.0);

  // Optical path difference -> phase. Scaled so a card shows a few full bands.
  // Fewer bands across the window: at 9.0 the grain was fine enough to read as
  // noise rather than as sheet foil at the size the art window actually is.
  float phase = (thickness * 5.0 + incidence * 3.2 + u_time * 0.35) * 3.14159;

  // Three phase-offset samples approximate the RGB response of the interference.
  vec3 interference = 0.5 + 0.5 * cos(phase + vec3(0.0, 2.094, 4.188));

  // Pull the bands well back toward their own luminance. At full saturation the
  // interference is a screaming rainbow that outshouts the rarity foil layered
  // over it — which inverts the whole point of the tiers. Real foil stock is
  // mostly a pale sheen with colour only where the film catches the light.
  float luma = dot(interference, vec3(0.299, 0.587, 0.114));
  interference = mix(vec3(luma), interference, 0.42);

  // Bias toward the skill's own colour so the foil belongs to the logo under it.
  vec3 color = mix(interference, interference * u_tint * 1.6, 0.45);

  // Specular sheen tracking the pointer.
  float sheen = pow(incidence, 3.0) * 0.55;
  color += sheen;

  // A fine anisotropic streak, the brushed-metal direction of real foil.
  float streak = sin((p.x + p.y) * 140.0 + thickness * 12.0) * 0.5 + 0.5;
  color *= 0.88 + streak * 0.12;

  // On latte the whole thing is pulled toward white and dialled down, otherwise
  // color-dodge compositing over a light surface clips to pure white.
  if (u_light > 0.5) {
    color = mix(color, vec3(1.0), 0.45);
    color *= 0.75;
  }

  outColor = vec4(color * u_intensity, 1.0);
}`;

type Program = {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  /** `gl.useProgram`, pre-bound — lint reads a bare `gl.useProgram(...)` call
   *  as a React hook in the wrong place, so it's never called by that name. */
  bindProgram: (program: WebGLProgram) => void;
  uniforms: {
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    pointer: WebGLUniformLocation | null;
    seed: WebGLUniformLocation | null;
    tint: WebGLUniformLocation | null;
    light: WebGLUniformLocation | null;
    intensity: WebGLUniformLocation | null;
  };
};

export type FoilParams = {
  /** Stable per-skill number, so two cards don't render the same grain. */
  seed: number;
  /** RGB in 0–1, the colour the foil leans toward. */
  tint: [number, number, number];
  isLightTheme: boolean;
};

let canvas: HTMLCanvasElement | null = null;
let compiled: Program | null = null;
/** Set once a context has failed; callers then fall back to the CSS foil. */
let unavailable = false;

const textureCache = new Map<string, string>();

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Surfacing this is worth it — a silent black window looks like a CSS bug.
    console.warn('[foil] shader compile failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Lazily builds the shared canvas + program. Returns null if WebGL2 is out. */
function ensureProgram(): Program | null {
  if (compiled) return compiled;
  if (unavailable || typeof document === 'undefined') return null;

  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  // `preserveDrawingBuffer` is what lets us call toDataURL for static frames.
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
    powerPreference: 'low-power',
  });

  if (!gl) {
    unavailable = true;
    canvas = null;
    return null;
  }

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = vs && fs ? gl.createProgram() : null;

  if (!vs || !fs || !program) {
    unavailable = true;
    canvas = null;
    return null;
  }

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('[foil] program link failed:', gl.getProgramInfoLog(program));
    unavailable = true;
    canvas = null;
    return null;
  }

  const bindProgram = gl.useProgram.bind(gl);
  bindProgram(program);

  // A single full-viewport triangle — cheaper than a quad and avoids the
  // diagonal seam a two-triangle quad can show under some drivers.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  // Losing the context (tab backgrounded, GPU reset) must not leave every card
  // painting a dead canvas — drop to the CSS fallback instead.
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    compiled = null;
    unavailable = true;
  });

  compiled = {
    gl,
    program,
    bindProgram,
    uniforms: {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      pointer: gl.getUniformLocation(program, 'u_pointer'),
      seed: gl.getUniformLocation(program, 'u_seed'),
      tint: gl.getUniformLocation(program, 'u_tint'),
      light: gl.getUniformLocation(program, 'u_light'),
      intensity: gl.getUniformLocation(program, 'u_intensity'),
    },
  };

  return compiled;
}

/** True when a WebGL2 context could be created — drives the CSS fallback. */
export function isFoilShaderAvailable(): boolean {
  return ensureProgram() !== null;
}

function draw(
  ctx: Program,
  width: number,
  height: number,
  params: FoilParams,
  time: number,
  pointer: [number, number]
) {
  const { gl, uniforms } = ctx;
  gl.viewport(0, 0, width, height);
  ctx.bindProgram(ctx.program);
  gl.uniform2f(uniforms.resolution, width, height);
  gl.uniform1f(uniforms.time, time);
  gl.uniform2f(uniforms.pointer, pointer[0], pointer[1]);
  gl.uniform1f(uniforms.seed, params.seed);
  gl.uniform3f(uniforms.tint, params.tint[0], params.tint[1], params.tint[2]);
  gl.uniform1f(uniforms.light, params.isLightTheme ? 1 : 0);
  gl.uniform1f(uniforms.intensity, params.isLightTheme ? 0.95 : 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/**
 * Renders a single resting frame for `cacheKey` and returns it as a data URL,
 * or null when WebGL is unavailable. Results are memoised, so calling this for
 * every card in a grid costs one draw per card, once.
 */
export function renderFoilTexture(
  cacheKey: string,
  params: FoilParams,
  // The art window is ~230×100 CSS px and the foil is all low-frequency colour,
  // so a buffer near half that upscales without visible softness — and keeps 65
  // baked data URLs down to roughly a megabyte in total.
  width = 224,
  height = 96
): string | null {
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const ctx = ensureProgram();
  if (!ctx || !canvas) return null;

  canvas.width = width;
  canvas.height = height;
  // Resting pointer sits off-centre so the still frame reads as lit.
  draw(ctx, width, height, params, 0, [0.35, 0.3]);

  const url = canvas.toDataURL('image/jpeg', 0.72);
  textureCache.set(cacheKey, url);
  return url;
}

export type LiveHandle = {
  /** Feeds card-local pointer position, both 0–1. */
  setPointer: (x: number, y: number) => void;
  /** Stops the loop and returns the canvas to the pool. */
  release: () => void;
};

/** The card currently holding the live canvas, so hand-offs can't interleave. */
let liveOwner: symbol | null = null;

/**
 * Moves the shared canvas into `host` and animates it until released. Returns
 * null when WebGL is unavailable, in which case the caller should keep showing
 * its static texture.
 */
export function acquireLiveCanvas(host: HTMLElement, params: FoilParams): LiveHandle | null {
  const ctx = ensureProgram();
  if (!ctx || !canvas) return null;

  const token = Symbol('foil-owner');
  liveOwner = token;

  const el = canvas;
  const rect = host.getBoundingClientRect();
  // Cap the buffer well under the layout size — foil is all low-frequency
  // colour, and a smaller buffer keeps the hover cheap on integrated GPUs.
  const dpr = Math.min(globalThis.devicePixelRatio ?? 1, 1.5);
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));

  el.width = width;
  el.height = height;
  el.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
  host.appendChild(el);

  const pointer: [number, number] = [0.5, 0.5];
  const start = performance.now();
  let frame = 0;

  const loop = () => {
    if (liveOwner !== token) return;
    draw(ctx, width, height, params, (performance.now() - start) / 1000, pointer);
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);

  return {
    setPointer: (x, y) => {
      pointer[0] = x;
      pointer[1] = y;
    },
    release: () => {
      if (liveOwner !== token) return;
      liveOwner = null;
      cancelAnimationFrame(frame);
      el.remove();
    },
  };
}
