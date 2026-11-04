"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── the curved row ──────────────────────────────────────────────
 * Scroll Tilted Grid turned on its side, with the tilt drawn as a curve.
 * One row of images streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you so each
 * end image curves along its length, and the ends fade into the page.
 *
 * Same geometry and props as the original CSS version, drawn on a <canvas>
 * instead. The CSS version cut every tile into 3D strips; on some GPUs the
 * joints between strips opened into dark hairlines across the photos, and
 * no amount of overlap fixed it on every machine. Here each frame is
 * painted column by column into one bitmap: a vertical line on the
 * cylinder stays vertical in perspective, so every column is just a scaled
 * slice of the image, and neighbouring columns overlap in 2D, where there
 * is no depth sorting to get wrong. No seams are possible.
 *
 * Work per frame is a few hundred drawImage calls; the loop only runs while
 * the hero is on screen. It keeps moving under prefers-reduced-motion on
 * purpose (the owner wants the effect always on): it is a slow, steady
 * drift with no flashes or jumps.
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

// Projected width, in CSS px, of each painted column. Small enough that the
// stepped top and bottom edges read as a smooth curve.
const COLUMN_PX = 3;

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

  // Decoded once per list; drawn as soon as each one arrives.
  const sources = React.useMemo(
    () =>
      images.map(({ src }) => {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        return img;
      }),
    [images],
  );

  React.useEffect(() => {
    const host = ref.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let layout = measure(1200, 560, tileHeight, aspectRatio, gap, bend);
    let raf = 0;
    let onScreen = false;
    const start = performance.now();

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const { columns, sweep, unit, limit } = layout;
      if (!W || !H || !unit || !sources.length) return;

      const r = W * arc(bend); // cylinder radius, px
      const P = r * CAMERA; // camera distance from the screen, px
      const h = Math.min(
        (tileHeight / 100) * H,
        ((MAX_WIDTH / 100) * W) / aspectRatio,
      );
      const cx = W / 2;
      const cy = (axis / 100) * H;
      const perTile = h / r; // radians one tile-height spans
      const sweepRad = (sweep * Math.PI) / 180;
      const limitRad = (limit * Math.PI) / 180;
      const loop = columns * speed;
      const time = (now - start) / 1000;

      // Screen x and scale of the column `v` tile-heights from a tile's left
      // edge, for a tile whose centre sits `ang` radians round the arc.
      // Positive angles swing left; the arc bends toward the camera.
      const project = (ang: number, v: number) => {
        const phi = ang + (aspectRatio / 2 - v) * perTile;
        const z = r * (1 - Math.cos(phi));
        if (z >= P * 0.95) return null; // at or behind the lens
        const s = P / (P - z);
        return { x: cx - r * Math.sin(phi) * s, s };
      };

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

        // object-cover crop of the source to the tile's aspect
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        let sw = iw;
        let sh = iw / aspectRatio;
        if (sh > ih) {
          sh = ih;
          sw = ih * aspectRatio;
        }
        const sx = (iw - sw) / 2;
        const sy = (ih - sh) / 2;

        const a = project(ang, 0);
        const b = project(ang, aspectRatio);
        const span = a && b ? Math.abs(b.x - a.x) : W;
        const n = Math.min(400, Math.max(16, Math.ceil(span / COLUMN_PX)));

        let prev = project(ang, 0);
        for (let j = 0; j < n; j++) {
          const next = project(ang, ((j + 1) / n) * aspectRatio);
          const cur = prev;
          prev = next;
          if (!cur || !next) continue;
          const x0 = cur.x;
          const x1 = next.x;
          if (x1 <= x0 || x1 < 0 || x0 > W) continue; // facing away / off canvas
          const s = (cur.s + next.s) / 2;
          const dh = h * s;
          const dy = cy - dh / 2;
          // Each column reaches a little under the next, which is painted
          // over it: the soft edge always lands on image, never on page.
          const dw = x1 - x0 + (j < n - 1 ? 0.75 : 0);
          const srcX = sx + (sw * j) / n;
          const srcW = sw / n;

          // roundRect: Safari 16+ / Firefox 112+; older ones get square ends
          if ((j === 0 || j === n - 1) && typeof ctx.roundRect === "function") {
            const rad = Math.min(RADIUS * s, dw, dh / 2);
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x0, dy, dw, dh, j === 0 ? [rad, 0, 0, rad] : [0, rad, rad, 0]);
            ctx.clip();
            ctx.drawImage(img, srcX, sy, srcW, sh, x0, dy, dw, dh);
            ctx.restore();
          } else {
            ctx.drawImage(img, srcX, sy, srcW, sh, x0, dy, dw, dh);
          }
        }
      }
    };

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
      ctx.imageSmoothingQuality = "high";
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

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      sources.forEach((img) => img.removeEventListener("load", onLoad));
    };
  }, [sources, speed, tileHeight, aspectRatio, gap, axis, bend]);

  const mask = `linear-gradient(90deg,transparent ${EDGE}%,#000 ${
    EDGE + fade
  }%,#000 ${100 - EDGE - fade}%,transparent ${100 - EDGE}%)`;

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500"
        style={{ opacity: ready ? 1 : 0, maskImage: mask, WebkitMaskImage: mask }}
      />
      {children}
    </div>
  );
}

export default TiltedGridHero;
