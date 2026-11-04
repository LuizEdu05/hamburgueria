"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── the curved row ──────────────────────────────────────────────
 * Scroll Tilted Grid turned on its side, with the tilt drawn as a curve.
 * One row of images streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you so each
 * end image curves along its length, and the ends fade into the page.
 *
 * Same geometry and props as the original CSS version, drawn on a canvas.
 * The CSS version cut every tile into 3D strips; on some GPUs the joints
 * between strips opened into dark hairlines. Here every tile is ONE mesh:
 *
 *  - WebGL (default): each tile is a triangle strip whose columns are
 *    projected onto the cylinder in JS; the GPU fills it with the photo in
 *    a single draw call. Rounded corners and the fade at both ends are done
 *    in the fragment shader. Smooth, seamless and very cheap on phones.
 *  - Canvas 2D (fallback, no WebGL): the same columns painted as scaled
 *    slices of a pre-scaled photo, clipped by the tile's smooth outline.
 *
 * The loop only runs while the hero is on screen. It keeps moving under
 * prefers-reduced-motion on purpose (the owner wants the effect always
 * on): it is a slow, steady drift with no flashes or jumps.
 * ─────────────────────────────────────────────────────────────── */

// Camera distance from the screen, as a multiple of the cylinder's radius.
// Just past the axis, so the ends come right up to the lens and swell; much
// further back and the row flattens out however tight the cylinder.
const CAMERA = 1.6;

/**
 * Cylinder radius, as a share of the hero's width, that puts the frame's
 * edge `bend` radians round the arc as seen through the camera:
 * r·sinθ · CAMERA / (CAMERA − 1 + cosθ) = width / 2, solved for r.
 */
function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

// A tile is never wider than this share of the hero, so a phone still
// shows its neighbours instead of one tile edge to edge.
const MAX_WIDTH = 55;

// Projected width, in CSS px, of each mesh column (WebGL) / painted
// column (2D). The GPU interpolates inside a column, so it can be wide.
const COLUMN_PX = { gl: 8, "2d": 4 } as const;

// Pre-scaled copy of each photo, as a multiple of the tile's on-screen
// height in device pixels. Tiles swell toward the ends, so a little extra
// keeps them sharp there; much more just wastes memory and bandwidth.
const CACHE_SCALE = 1.35;

// Corner radius of a tile, in CSS px at the tile's own scale.
const RADIUS = 8;

// Share of the hero's width, at each end, kept fully transparent before the
// fade starts. A tile entering edge-on is only a few pixels wide there and
// would otherwise read as a thin dark line along the frame's edge.
const EDGE = 2.5;

/**
 * Lays the loop on the cylinder. The radius puts the frame's edge `bend`
 * radians round the arc (see `arc`). Angles come back in degrees: `unit`
 * is the arc one tile-height spans, `limit` how far round a tile's centre
 * can go before the whole tile is off-screen, and `sweep` how far round
 * the loop's ends sit. The loop reaches past `limit`, so a tile only ever
 * wraps out of sight, and is rounded up to a whole number of tiles so the
 * gap never stretches.
 */
function measure(
  width: number,
  height: number,
  tile: number,
  aspect: number,
  gap: number,
  bend: number,
) {
  const h = Math.min(
    (tile / 100) * height,
    ((MAX_WIDTH / 100) * width) / aspect,
  );
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0))
    return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  // Capped so a hero squeezed to a sliver can't draw thousands of tiles.
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
  };
}

/* ── WebGL ─────────────────────────────────────────────────────── */

const VERT = `
attribute vec2 a_pos;
attribute vec3 a_uvq; // (u, v) * q, q: perspective-correct interpolation
uniform vec2 u_res;
varying vec3 v_uvq;
varying float v_x;
void main() {
  v_uvq = a_uvq;
  v_x = a_pos.x;
  vec2 c = a_pos / u_res * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform float u_aspect;  // tile width / height
uniform float u_radius;  // corner radius, in tile heights
uniform float u_px;      // CSS px per tile height, for corner anti-aliasing
uniform float u_w;       // hero width, CSS px
uniform float u_edge;    // transparent band at each end, CSS px
uniform float u_fade;    // fade width, CSS px
varying vec3 v_uvq;
varying float v_x;
void main() {
  // Each column is a trapezoid; plain (affine) interpolation would zigzag
  // the photo where a tile swells toward the camera. Dividing by q, the
  // column's on-screen scale, undoes that.
  vec2 v_uv = v_uvq.xy / v_uvq.z;
  vec2 size = vec2(u_aspect, 1.0);
  vec2 q = abs(v_uv * size - size * 0.5) - (size * 0.5 - u_radius);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - u_radius;
  float corner = clamp(0.5 - d * u_px, 0.0, 1.0);
  float fade = clamp((v_x - u_edge) / u_fade, 0.0, 1.0)
             * clamp((u_w - u_edge - v_x) / u_fade, 0.0, 1.0);
  gl_FragColor = texture2D(u_tex, v_uv) * (corner * fade);
}`;

type GL = {
  gl: WebGLRenderingContext;
  buf: WebGLBuffer;
  u: Record<"res" | "aspect" | "radius" | "px" | "w" | "edge" | "fade", WebGLUniformLocation | null>;
};

function initGL(canvas: HTMLCanvasElement): GL | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
  });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  const buf = gl.createBuffer();
  if (!vs || !fs || !prog || !buf) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  const aPos = gl.getAttribLocation(prog, "a_pos");
  const aUv = gl.getAttribLocation(prog, "a_uvq");
  gl.enableVertexAttribArray(aPos);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 20, 0);
  gl.vertexAttribPointer(aUv, 3, gl.FLOAT, false, 20, 8);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied
  gl.clearColor(0, 0, 0, 0);
  const loc = (n: string) => gl.getUniformLocation(prog, n);
  return {
    gl,
    buf,
    u: {
      res: loc("u_res"),
      aspect: loc("u_aspect"),
      radius: loc("u_radius"),
      px: loc("u_px"),
      w: loc("u_w"),
      edge: loc("u_edge"),
      fade: loc("u_fade"),
    },
  };
}

/* ── component ─────────────────────────────────────────────────── */

export type TiltedGridImage = {
  src: string;
  /** Kept for API compatibility; the band is decorative and aria-hidden. */
  alt?: string;
};

export type TiltedGridHeroProps = {
  /**
   * Images run along the row in order. A tile takes its next image each
   * time it wraps off-screen, so the whole list plays through however
   * few tiles the frame needs. Short lists simply repeat.
   * Served with CORS (e.g. Unsplash) so they can be used as GPU textures.
   */
  images: TiltedGridImage[];
  /**
   * Seconds for the row to advance by one tile. Speed is per tile, not per
   * crossing, so a phone and an ultrawide move at the same pace.
   * @default 4
   */
  speed?: number;
  /** Tile height, as a percentage of the hero's height. @default 26 */
  tileHeight?: number;
  /** Tile width divided by tile height. @default 16 / 9 */
  aspectRatio?: number;
  /** Space between tiles, as a percentage of a tile's height. @default 6 */
  gap?: number;
  /** Vertical centre of the row, as a percentage of the hero's height. @default 56 */
  axis?: number;
  /**
   * How far the row has bent round by the frame's edge, in degrees. Higher
   * curls the ends harder toward the viewer. Clamped to 5–85.
   * @default 80
   */
  curve?: number;
  /** Width of the fade at each end, as a percentage of the hero's width. @default 12 */
  fade?: number;
  /** Content rendered above the band. */
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;
  // Hidden until the first frame is laid out for the real size.
  const [ready, setReady] = React.useState(false);

  // Decoded once per list; drawn as soon as each one arrives. CORS so the
  // photos can be uploaded as WebGL textures.
  const sources = React.useMemo(
    () =>
      images.map(({ src }) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.src = src;
        return img;
      }),
    [images],
  );

  React.useEffect(() => {
    const host = ref.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    // WebGL if we can, 2D otherwise. A canvas keeps the first context type
    // it hands out, so the choice is made once here.
    let gpu = initGL(canvas);
    const ctx = gpu ? null : canvas.getContext("2d");
    if (!gpu && !ctx) return;
    const mode = gpu ? "gl" : "2d";

    let W = 0;
    let H = 0;
    let dpr = 1;
    let layout = measure(1200, 560, tileHeight, aspectRatio, gap, bend);
    let raf = 0;
    let onScreen = false;
    const start = performance.now();

    // Each photo, cropped to the tile's aspect (object-cover) and scaled
    // once to the size it is drawn at, plus its GPU texture in WebGL mode.
    const bitmaps = new Map<HTMLImageElement, HTMLCanvasElement>();
    const textures = new Map<HTMLImageElement, WebGLTexture>();
    let cacheH = 0;
    const dropCaches = () => {
      bitmaps.clear();
      if (gpu) textures.forEach((t) => gpu?.gl.deleteTexture(t));
      textures.clear();
    };
    const bitmap = (img: HTMLImageElement, targetH: number) => {
      if (Math.abs(targetH - cacheH) > cacheH * 0.15) {
        dropCaches(); // tile size changed a lot (resize): rebuild lazily
        cacheH = targetH;
      }
      const hit = bitmaps.get(img);
      if (hit) return hit;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      let sw = iw;
      let sh = iw / aspectRatio;
      if (sh > ih) {
        sh = ih;
        sw = ih * aspectRatio;
      }
      const c = document.createElement("canvas");
      c.height = Math.max(1, Math.round(cacheH));
      c.width = Math.max(1, Math.round(cacheH * aspectRatio));
      const g = c.getContext("2d");
      if (!g) return null;
      g.imageSmoothingQuality = "high";
      g.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, c.width, c.height);
      bitmaps.set(img, c);
      return c;
    };
    const texture = (img: HTMLImageElement, targetH: number) => {
      if (!gpu) return null;
      const bmp = bitmap(img, targetH);
      if (!bmp) return null;
      const hit = textures.get(img);
      if (hit) return hit;
      const { gl } = gpu;
      const tex = gl.createTexture();
      if (!tex) return null;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
      } catch {
        gl.deleteTexture(tex); // photo served without CORS: skip it
        return null;
      }
      textures.set(img, tex);
      return tex;
    };

    // Projected columns of the tile being drawn: x, top and bottom (CSS px).
    const xs: number[] = [];
    const tops: number[] = [];
    const bots: number[] = [];
    const verts = new Float32Array(5 * 2 * 400);

    /**
     * Walks the visible tiles for time `now` and projects each one's
     * columns into xs/tops/bots. `paint` gets the photo, the run of columns
     * [from, to] that faces the camera, the column count and the tile size.
     */
    const eachTile = (
      now: number,
      paint: (img: HTMLImageElement, from: number, to: number, n: number, h: number) => void,
    ) => {
      const { columns, sweep, unit, limit } = layout;
      if (!W || !H || !unit || !sources.length) return;
      const r = W * arc(bend); // cylinder radius, px
      const P = r * CAMERA; // camera distance from the screen, px
      const h = Math.min((tileHeight / 100) * H, ((MAX_WIDTH / 100) * W) / aspectRatio);
      const cx = W / 2;
      const cy = (axis / 100) * H;
      const perTile = h / r; // radians one tile-height spans
      const sweepRad = (sweep * Math.PI) / 180;
      const limitRad = (limit * Math.PI) / 180;
      const loop = columns * speed;
      const time = (now - start) / 1000;

      for (let t = 0; t < columns; t++) {
        // Tile t starts t tiles along the loop, as the CSS delays did.
        const local = time + t * speed;
        const lap = Math.floor(local / loop);
        const ang = -sweepRad + 2 * sweepRad * (local / loop - lap);
        if (Math.abs(ang) > limitRad) continue; // wholly off-screen

        // Tile `columns - 1` starts nearest the exit and tile 0 furthest
        // back; each lap hands a tile the next image in the run.
        const index = lap * columns + (columns - 1 - t);
        const img = sources[((index % sources.length) + sources.length) % sources.length];
        if (!img.complete || !img.naturalWidth) continue;

        // A vertical line on the cylinder stays vertical in perspective, so
        // each column is a scaled slice. Positive angles swing left; the
        // arc bends toward the camera.
        const phiL = ang + (aspectRatio / 2) * perTile;
        const phiR = phiL - aspectRatio * perTile;
        const span = Math.abs(r * (Math.sin(phiL) - Math.sin(phiR)));
        // WebGL interpolates inside a column (perspective-correct), so a few
        // wide columns are enough. 2D paints flat slices: there the height
        // may change by only ~1px between neighbours or the photo steps.
        let n = Math.ceil(span / COLUMN_PX[mode]);
        if (mode === "2d") {
          const scaleAt = (phi: number) => P / Math.max(P * 0.05, P - r * (1 - Math.cos(phi)));
          const sMin = Math.abs(ang) < aspectRatio * perTile ? 1 : Math.min(scaleAt(phiL), scaleAt(phiR));
          n = Math.max(n, Math.ceil((h * (Math.max(scaleAt(phiL), scaleAt(phiR)) - sMin)) / 1.2));
        }
        n = Math.min(399, Math.max(12, n));
        let from = -1;
        let to = -1;
        for (let j = 0; j <= n; j++) {
          const phi = phiL - (j / n) * aspectRatio * perTile;
          const z = r * (1 - Math.cos(phi));
          const ok = z < P * 0.95; // in front of the lens
          const s = ok ? P / (P - z) : 0;
          xs[j] = cx - r * Math.sin(phi) * s;
          tops[j] = cy - (h * s) / 2;
          bots[j] = cy + (h * s) / 2;
          // keep the first contiguous run of columns facing the camera
          if (!ok) continue;
          if (from < 0) {
            from = j;
            to = j;
          } else if (to === j - 1 && xs[j] > xs[j - 1]) {
            to = j;
          }
        }
        if (from < 0 || to - from < 1 || xs[to] < 0 || xs[from] > W) continue;
        paint(img, from, to, n, h);
      }
    };

    /* WebGL frame: one triangle strip per tile. */
    const drawGL = (now: number) => {
      if (!gpu) return;
      const { gl, buf, u } = gpu;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!W || !H) return;
      gl.uniform2f(u.res, W, H);
      gl.uniform1f(u.aspect, aspectRatio);
      gl.uniform1f(u.w, W);
      gl.uniform1f(u.edge, (EDGE / 100) * W);
      gl.uniform1f(u.fade, Math.max(1, (fade / 100) * W));
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      eachTile(now, (img, from, to, n, h) => {
        const tex = texture(img, h * dpr * CACHE_SCALE);
        if (!tex) return;
        let k = 0;
        for (let j = from; j <= to; j++) {
          const q = (bots[j] - tops[j]) / h; // on-screen scale of this column
          const u0 = (j / n) * q;
          verts[k++] = xs[j];
          verts[k++] = tops[j];
          verts[k++] = u0;
          verts[k++] = 0;
          verts[k++] = q;
          verts[k++] = xs[j];
          verts[k++] = bots[j];
          verts[k++] = u0;
          verts[k++] = q;
          verts[k++] = q;
        }
        // CSS px per tile height at the tile's taller end, for corner AA
        const px = Math.max(bots[from] - tops[from], bots[to] - tops[to]);
        gl.uniform1f(u.radius, RADIUS / h);
        gl.uniform1f(u.px, px);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.bufferData(gl.ARRAY_BUFFER, verts.subarray(0, k), gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, k / 5);
      });
    };

    /* Canvas 2D frame (no WebGL): scaled slices clipped by a smooth outline. */
    const outline = (c: CanvasRenderingContext2D, from: number, to: number, rad: number) => {
      const slope = (arr: number[], i: number, j: number) => (arr[j] - arr[i]) / (xs[j] - xs[i] || 1);
      const r0 = Math.max(0, Math.min(rad, (xs[to] - xs[from]) / 2));
      c.beginPath();
      c.moveTo(xs[from], tops[from] + r0);
      c.quadraticCurveTo(xs[from], tops[from], xs[from] + r0, tops[from] + slope(tops, from, from + 1) * r0);
      for (let j = from + 1; j < to; j++) c.lineTo(xs[j], tops[j]);
      c.lineTo(xs[to] - r0, tops[to] - slope(tops, to - 1, to) * r0);
      c.quadraticCurveTo(xs[to], tops[to], xs[to], tops[to] + r0);
      c.lineTo(xs[to], bots[to] - r0);
      c.quadraticCurveTo(xs[to], bots[to], xs[to] - r0, bots[to] - slope(bots, to - 1, to) * r0);
      for (let j = to - 1; j > from; j--) c.lineTo(xs[j], bots[j]);
      c.lineTo(xs[from] + r0, bots[from] + slope(bots, from, from + 1) * r0);
      c.quadraticCurveTo(xs[from], bots[from], xs[from], bots[from] - r0);
      c.closePath();
    };
    const draw2D = (now: number) => {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      eachTile(now, (img, from, to, n, h) => {
        const src = bitmap(img, h * dpr * CACHE_SCALE);
        if (!src) return;
        ctx.save();
        outline(ctx, from, to, RADIUS * ((bots[from] - tops[from]) / h));
        ctx.clip();
        const sw = src.width / n;
        for (let j = from; j < to; j++) {
          const dh = (bots[j] - tops[j] + bots[j + 1] - tops[j + 1]) / 2;
          ctx.drawImage(src, sw * j, 0, sw, src.height, xs[j], (tops[j] + bots[j]) / 2 - dh / 2, xs[j + 1] - xs[j] + 0.75, dh);
        }
        ctx.restore();
      });
      // fade both ends out inside the canvas
      const fadeW = (fade / 100) * W;
      const edgeW = (EDGE / 100) * W;
      ctx.globalCompositeOperation = "destination-out";
      for (const left of [true, false]) {
        const outer = left ? edgeW : W - edgeW;
        const inner = left ? edgeW + fadeW : W - edgeW - fadeW;
        const g = ctx.createLinearGradient(outer, 0, inner, 0);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(Math.min(outer, inner), 0, fadeW, H);
        ctx.fillStyle = "#000";
        ctx.fillRect(left ? 0 : W - edgeW, 0, edgeW, H);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const draw = mode === "gl" ? drawGL : draw2D;
    const tick = (now: number) => {
      draw(now);
      raf = onScreen ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      W = width;
      H = height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      if (ctx) ctx.imageSmoothingQuality = "low"; // bitmaps are pre-scaled
      layout = measure(W, H, tileHeight, aspectRatio, gap, bend);
      setReady(W > 0 && H > 0);
      kick();
    });
    ro.observe(host);

    // Only animate while the hero is in view.
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) kick();
    });
    io.observe(host);

    // Paint each image the moment it arrives, even when paused.
    const onLoad = () => kick();
    sources.forEach((img) => img.addEventListener("load", onLoad));

    // The GPU can drop the context (backgrounded tab, driver reset): rebuild.
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => {
      gpu = initGL(canvas);
      textures.clear();
      bitmaps.clear();
      cacheH = 0;
      kick();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      sources.forEach((img) => img.removeEventListener("load", onLoad));
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      dropCaches();
    };
  }, [sources, speed, tileHeight, aspectRatio, gap, axis, bend, fade]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500"
        style={{ opacity: ready ? 1 : 0 }}
      />
      {children}
    </div>
  );
}

export default TiltedGridHero;
