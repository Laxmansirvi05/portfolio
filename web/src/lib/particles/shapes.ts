/**
 * Particle target shapes for the hero morph.
 * Each shape writes the position of particle `i` at time `t` (seconds) into `out`.
 * Shapes are built once on the client (the LS monogram needs a 2D canvas).
 */

export type Vec3 = [number, number, number];
export type Shape = (i: number, t: number, out: Vec3) => void;

export const SHAPE_NAMES = ["LS", "Möbius", "Globe"] as const;
export const GLOBE_INDEX = 2;

const TAU = Math.PI * 2;

/** Seeded PRNG so every visit forms the same figures. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Filled pixels of a 2D drawing as normalised [x, y] (y up, longest side spans -1..1). */
function canvasPoints(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  draw(ctx);
  const data = ctx.getImageData(0, 0, w, h).data;
  const s = 2 / Math.max(w, h);
  const pts: [number, number][] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 128) pts.push([(x - w / 2) * s, -(y - h / 2) * s]);
  return pts;
}

function monogram(count: number, rand: () => number, font: string): Shape {
  const pts = canvasPoints(440, 260, (c) => {
    c.font = `500 230px ${font}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("LS", 220, 140);
  });
  const base = Array.from({ length: count }, () => {
    const p = pts[(rand() * pts.length) | 0] ?? [0, 0];
    return [p[0] * 1.45, p[1] * 1.45, (rand() - 0.5) * 0.3] as Vec3;
  });
  return (i, t, o) => {
    const b = base[i];
    o[0] = b[0];
    o[1] = b[1] + Math.sin(t * 1.2 + b[0] * 3) * 0.015;
    o[2] = b[2];
  };
}

function mobius(count: number, rand: () => number): Shape {
  // even grid across the band (lightly jittered) so it reads as a woven surface, not clumps
  const cols = Math.round(Math.sqrt(count * 7)), rows = Math.ceil(count / cols);
  const uv = Array.from({ length: count }, (_, i) => [
    ((i % cols) + rand() * 0.5) / cols * TAU,
    (Math.floor(i / cols) + rand() * 0.5) / rows - 0.5,
  ]);
  return (i, t, o) => {
    const u = uv[i][0] + t * 0.18;
    const v = uv[i][1] * 0.66;
    const R = 1.12;
    const h = Math.cos(u / 2) * v;
    // tilt the ring towards the viewer so the twist reads
    const x = (R + h) * Math.cos(u);
    const y = (R + h) * Math.sin(u);
    const z = Math.sin(u / 2) * v;
    const a = 1.0;
    o[0] = x;
    o[1] = y * Math.cos(a) - z * Math.sin(a);
    o[2] = y * Math.sin(a) + z * Math.cos(a);
  };
}

/**
 * Simplified continent outlines as [longitude, latitude] polygons, hand-drawn from a world map.
 * Coarse on purpose: at hero size the particle globe only needs recognisable silhouettes.
 */
const CONTINENTS: [number, number][][] = [
  // North America
  [[-168, 66], [-140, 70], [-100, 72], [-80, 68], [-62, 60], [-55, 50], [-66, 44], [-76, 35], [-81, 25], [-90, 29], [-97, 26],
   [-105, 20], [-95, 16], [-84, 10], [-80, 8], [-90, 14], [-105, 22], [-117, 32], [-124, 40], [-125, 49], [-135, 58], [-150, 60], [-165, 60]],
  // Greenland
  [[-55, 82], [-25, 83], [-20, 70], [-42, 60], [-55, 68]],
  // South America
  [[-80, 8], [-62, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-72, -50], [-73, -35], [-70, -18], [-81, -5]],
  // Europe
  [[-10, 36], [-9, 44], [-2, 48], [-5, 58], [5, 62], [15, 70], [30, 71], [40, 66], [30, 60], [28, 46], [40, 42], [26, 40], [20, 40],
   [12, 44], [8, 44], [3, 42], [-5, 36]],
  // Great Britain
  [[-6, 50], [2, 51], [0, 57], [-5, 58], [-6, 55]],
  // Africa
  [[-17, 21], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [40, -2], [40, -15], [33, -26],
   [20, -35], [15, -28], [12, -15], [9, -1], [9, 4], [-8, 4], [-15, 10]],
  // Madagascar
  [[44, -16], [50, -15], [48, -25], [44, -23]],
  // Asia (with Arabia and India)
  [[28, 46], [40, 42], [36, 36], [35, 31], [43, 13], [52, 16], [57, 25], [60, 22], [67, 25], [73, 20], [77, 8], [80, 15], [88, 22],
   [98, 16], [100, 5], [104, 1], [106, 10], [110, 20], [122, 30], [122, 40], [130, 42], [140, 50], [142, 60], [160, 60], [180, 68],
   [180, 72], [140, 74], [110, 77], [80, 73], [60, 70], [50, 67], [40, 66], [30, 60]],
  // Japan
  [[130, 31], [141, 35], [142, 41], [140, 44], [136, 37]],
  // Borneo / Indonesia
  [[109, 1], [118, 7], [119, -3], [110, -3]],
  [[95, 5], [106, -6], [104, -5]],
  // Australia
  [[114, -22], [122, -18], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [141, -38], [131, -31], [115, -34]],
];

export type GlobeShape = { shape: Shape; fold: Float32Array };

/**
 * Globe: land drawn densely in triangles (recognisable continents), oceans shown only by a
 * sparse latitude/longitude grid, plus a thin atmosphere shell. It turns slowly on a tilted
 * axis and starts with India facing the viewer. `fold` marks land (1) vs grid (0.45) vs
 * atmosphere (0.6) so the shader can light the land and keep the oceans quiet.
 */
function globe(count: number, rand: () => number): GlobeShape {
  // land mask: rasterise the outlines onto an equirectangular canvas (1px per degree)
  const W = 360, H = 180;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  for (const poly of CONTINENTS) {
    ctx.beginPath();
    poly.forEach(([lon, lat], k) => (k ? ctx.lineTo(lon + 180, 90 - lat) : ctx.moveTo(lon + 180, 90 - lat)));
    ctx.closePath();
    ctx.fill();
  }
  const mask = ctx.getImageData(0, 0, W, H).data;
  const isLand = (lon: number, lat: number) => {
    const x = Math.min(W - 1, Math.max(0, Math.floor(lon + 180))), y = Math.min(H - 1, Math.max(0, Math.floor(90 - lat)));
    return mask[(y * W + x) * 4 + 3] > 128;
  };

  const R = 0.86;
  const ll: [number, number, number][] = []; // lon, lat (degrees), radius
  const fold = new Float32Array(count);
  const nLand = Math.round(count * 0.68), nGrid = Math.round(count * 0.24);
  while (ll.length < nLand) {
    const lat = (Math.asin(2 * rand() - 1) * 180) / Math.PI, lon = rand() * 360 - 180; // uniform on the sphere
    if (!isLand(lon, lat)) continue;
    fold[ll.length] = 1;
    ll.push([lon, lat, R * (1 + rand() * 0.012)]);
  }
  while (ll.length < nLand + nGrid) {
    // meridians every 30°, parallels every 30°, as dotted lines over the oceans
    const onMeridian = rand() < 0.5;
    const lon = onMeridian ? Math.round((rand() * 360 - 180) / 30) * 30 : rand() * 360 - 180;
    const lat = onMeridian ? rand() * 170 - 85 : Math.round((rand() * 150 - 75) / 30) * 30;
    if (isLand(lon, lat)) continue;
    fold[ll.length] = 0.45;
    ll.push([lon, lat, R]);
  }
  while (ll.length < count) {
    const lat = (Math.asin(2 * rand() - 1) * 180) / Math.PI, lon = rand() * 360 - 180;
    fold[ll.length] = 0.6;
    ll.push([lon, lat, R * (1.07 + rand() * 0.05)]); // atmosphere shell
  }

  const D = Math.PI / 180, TILT = 23.4 * D, ct = Math.cos(TILT), st = Math.sin(TILT);
  const shape: Shape = (i, t, o) => {
    const [lon, lat, r] = ll[i];
    const a = (lon - 78) * D - t * 0.12; // India (78°E) faces the viewer at t = 0, then it turns east
    const cl = Math.cos(lat * D);
    const x = cl * Math.sin(a) * r, y = Math.sin(lat * D) * r, z = cl * Math.cos(a) * r;
    // axial tilt (towards the viewer's right)
    o[0] = x * ct - y * st;
    o[1] = x * st + y * ct;
    o[2] = z;
  };
  return { shape, fold };
}

export function buildShapes(count: number, font: string): { shapes: Shape[]; fold: Float32Array } {
  const rand = mulberry32(2203);
  const g = globe(count, rand);
  return { shapes: [monogram(count, rand, font), mobius(count, rand), g.shape], fold: g.fold };
}
