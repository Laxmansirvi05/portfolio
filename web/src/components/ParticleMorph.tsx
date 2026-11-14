"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLOBE_INDEX, buildShapes, SHAPE_NAMES, type Vec3 } from "@/lib/particles/shapes";

const ASSEMBLE = 2.0; // seconds for the scattered swarm to form the first shape
const HOLD = 3.2;     // seconds each shape is held
const MOVE = 1.6;     // seconds for each refold
const FOCUS = 6;      // camera distance that is in perfect focus (the object's plane)

/** Shared GLSL: outlined equilateral triangle SDF. */
const TRI = /* glsl */ `
  float tri(vec2 p, float r){
    const float k = 1.7320508;
    p.x = abs(p.x) - r; p.y = p.y + r / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0 * r, 0.0);
    return -length(p) * sign(p.y);
  }`;

/**
 * Object particles. Colour is decided by where a particle sits, like the reference:
 * - towards the silhouette (screen-space distance from the object's centre) → amber / yellow rim
 * - facing the viewer in the middle → white / pale lilac
 * - slow-moving 3D noise patches → violet and teal islands across the surface
 * A small per-particle jitter keeps it from looking computed.
 */
const OBJ_VERT = /* glsl */ `
  attribute float rnd; attribute float size; attribute float rot; attribute float fold;
  uniform float uPx; uniform float uTime; uniform float uRadius; uniform float uGlobe; uniform float uLS; uniform float uFade;
  varying vec3 vColor; varying float vRot; varying float vAlpha; varying float vBlur;

  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec4 c  = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uPx / -mv.z;

    vec2 rel = (mv.xy - c.xy) / uRadius;
    float r = clamp(length(rel), 0.0, 1.0);
    float rim = smoothstep(0.32, 0.8, r + (rnd - 0.5) * 0.22);
    vec3 p = position * 1.7;
    float n = sin(p.x * 1.9 + uTime * 0.15) * sin(p.y * 2.3 - 0.7) * sin(p.z * 2.1 + uTime * 0.1 + 1.3);

    // core: soft white with a lilac/pink blush
    vec3 core   = mix(vec3(0.96, 0.94, 1.0), vec3(0.84, 0.76, 1.0), rnd);
    // rim: a sunset sweep across the silhouette, gold (lower-left) → coral → magenta-pink (upper-right)
    float sweep = smoothstep(-0.9, 0.9, rel.x * 0.7 + rel.y * 0.7 + (rnd - 0.5) * 0.3);
    vec3 gold   = mix(vec3(1.0, 0.74, 0.16), vec3(1.0, 0.86, 0.3), rnd);   // #ffb829 → #ffdb4d
    vec3 coral  = vec3(1.0, 0.48, 0.36);
    vec3 pink   = vec3(0.98, 0.36, 0.78);
    vec3 rimCol = sweep < 0.5 ? mix(gold, coral, sweep * 2.0) : mix(coral, pink, sweep * 2.0 - 1.0);
    vec3 violet = mix(vec3(0.50, 0.32, 1.0), vec3(0.68, 0.56, 1.0), rnd);  // #8052ff → lilac
    vec3 teal   = mix(vec3(0.16, 0.86, 0.74), vec3(0.35, 0.9, 1.0), rnd);  // mint → cyan

    // Which way this point's surface faces (from the object's centre): +z = towards the viewer.
    vec3 outward = normalize(mat3(modelViewMatrix) * position + vec3(1e-4));
    float facing = smoothstep(-0.35, 0.35, outward.z);
    // Globe: rim colour follows the real silhouette (fresnel-like), not just distance from centre.
    float edge = 1.0 - smoothstep(0.08, 0.72, outward.z + (rnd - 0.5) * 0.15);
    float rimMix = mix(rim, max(rim * 0.45, edge), uGlobe);

    vec3 col = mix(core, rimCol, rimMix);
    col = mix(col, violet, smoothstep(0.26, 0.5, n) * 0.85);
    col = mix(col, teal, smoothstep(-0.42, -0.62, n) * 0.75);

    // Globe only — a sunlit planet in the brand colours:
    // land by latitude: warm gold/coral tropics → mint mid-latitudes → icy white poles;
    // a sun from the upper left lights one side, the night side drifts into violet with a few
    // amber "city light" sparks; oceans are a quiet indigo grid; the atmosphere is a cyan
    // halo on the sunlit limb fading to violet on the dark one.
    float crest = smoothstep(0.3, 0.72, fold);
    float isGrid = 1.0 - smoothstep(0.4, 0.5, fold);
    float isAir = smoothstep(0.5, 0.58, fold) * (1.0 - smoothstep(0.62, 0.7, fold));
    float lat = abs(normalize(position).y);
    vec3 tropic = mix(vec3(1.0, 0.72, 0.2), vec3(1.0, 0.5, 0.38), rnd);      // gold → coral
    vec3 temperate = mix(vec3(0.2, 0.86, 0.68), vec3(0.45, 0.95, 0.85), rnd); // mint
    vec3 polar = vec3(0.9, 0.95, 1.0);                                        // ice
    vec3 land = mix(tropic, temperate, smoothstep(0.25, 0.55, lat));
    land = mix(land, polar, smoothstep(0.72, 0.88, lat));
    float sun = smoothstep(-0.25, 0.6, dot(outward, normalize(vec3(-0.55, 0.45, 0.7))));
    vec3 night = mix(vec3(0.36, 0.24, 0.85), vec3(1.0, 0.7, 0.3), step(0.93, rnd)); // violet, rare city lights
    land = mix(night, land * 1.15, sun);
    vec3 ocean = mix(vec3(0.3, 0.32, 0.95), vec3(0.42, 0.28, 0.9), rnd) * (0.45 + 0.4 * sun);
    vec3 air = mix(vec3(0.5, 0.32, 1.0), vec3(0.35, 0.92, 1.0), sun);
    vec3 globeCol = mix(land, ocean, isGrid);
    globeCol = mix(globeCol, air, isAir);
    col = mix(col, globeCol, uGlobe);

    // LS only: one clean diagonal gradient across the monogram (iris → magenta → gold),
    // with a few white sparks, instead of the generic rim/core colouring.
    float g = clamp(rel.x * 0.42 - rel.y * 0.3 + 0.5 + (rnd - 0.5) * 0.12, 0.0, 1.0);
    vec3 iris = vec3(0.50, 0.32, 1.0), magenta = vec3(0.95, 0.33, 0.78), goldLS = vec3(1.0, 0.74, 0.18);
    vec3 lsCol = g < 0.5 ? mix(iris, magenta, g * 2.0) : mix(magenta, goldLS, g * 2.0 - 1.0);
    if (rnd > 0.9) lsCol = mix(lsCol, vec3(1.0), 0.75);
    col = mix(col, lsCol, uLS);
    vColor = col;

    vRot = rot + uTime * (rnd - 0.5) * 0.15;
    vAlpha = clamp(1.75 - (-mv.z - (${FOCUS.toFixed(1)} - 1.2)) * 0.5, 0.3, 1.0); // far side dimmer
    // Globe: far side mostly hidden (solid planet); grid quieter than land; atmosphere only at the limb
    float limb = 1.0 - smoothstep(0.0, 0.55, abs(outward.z));
    float globeA = mix(0.55 + 0.45 * crest, 0.15 + 0.85 * limb, isAir) * (0.08 + 0.92 * facing);
    vAlpha *= mix(1.0, globeA, uGlobe);
    vAlpha *= uFade;                                                              // recedes past the hero
    vBlur = clamp(abs(-mv.z - ${FOCUS.toFixed(1)}) / 2.2, 0.0, 1.0) * 0.6;        // depth of field
  }`;

const FRAG = /* glsl */ `
  varying vec3 vColor; varying float vRot; varying float vAlpha; varying float vBlur;
  ${TRI}
  void main(){
    vec2 p = gl_PointCoord * 2.0 - 1.0; p.y = -p.y;
    float c = cos(vRot), s = sin(vRot); p = mat2(c, -s, s, c) * p;
    float d = abs(tri(p, 0.5));
    float w = mix(0.1, 0.32, vBlur);                         // outline softens out of focus
    float line = 1.0 - smoothstep(w * 0.5, w, d);
    float glow = exp(-d * 9.0) * 0.22;                        // faint bloom around each stroke
    float a = (line + glow) * mix(1.0, 0.55, vBlur);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }`;

/** Ambient triangles: fixed palette colours, strong depth of field (near ones big and soft). */
const AMB_VERT = /* glsl */ `
  attribute vec3 color; attribute float size; attribute float rot; attribute float rnd;
  uniform float uPx; uniform float uTime;
  varying vec3 vColor; varying float vRot; varying float vAlpha; varying float vBlur;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uPx / -mv.z;
    vColor = color;
    vRot = rot + uTime * (rnd - 0.5) * 0.3;
    vBlur = clamp(abs(-mv.z - ${FOCUS.toFixed(1)}) / 3.6, 0.0, 1.0) * 0.85;
    vAlpha = mix(0.9, 0.45, vBlur);
  }`;

/** Academics backdrop: a graduation cap in particle blades. Same triangle sprite; colour per particle; fades with uBook. */
const BOOK_VERT = /* glsl */ `
  attribute vec3 color; attribute float size; attribute float rot; attribute float rnd;
  uniform float uPx; uniform float uTime; uniform float uBook;
  varying vec3 vColor; varying float vRot; varying float vAlpha; varying float vBlur;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uPx / -mv.z;
    vColor = color;
    vRot = rot + uTime * (rnd - 0.5) * 0.2;
    vBlur = clamp(abs(-mv.z - ${FOCUS.toFixed(1)}) / 2.6, 0.0, 1.0) * 0.6;
    vAlpha = clamp(1.6 - (-mv.z - (${FOCUS.toFixed(1)} - 1.0)) * 0.45, 0.25, 1.0) * uBook * 0.55; // a little softer than the hero object: text sits on top
  }`;

/**
 * A graduation cap (mortarboard) in glowing 3D particle blades, styled like the reference's particle
 * object: a square board seen a little from above (teal → blue → violet across its diagonal), the cap
 * underneath (violet → pink), a button on top and a gold tassel that runs to a corner and hangs, swaying.
 * Axes: x = right, y = up, z = towards the viewer.
 */
function makeCap(count: number) {
  type Part = "board" | "rim" | "skull" | "button" | "cord" | "tassel";
  const kind: Part[] = new Array(count);
  const a = new Float32Array(count), b = new Float32Array(count), c = new Float32Array(count);
  const col = new Float32Array(count * 3);
  const tmp = new THREE.Color();
  const teal = new THREE.Color("#2fd3b0"), blue = new THREE.Color("#4f7bff"), violet = new THREE.Color("#8052ff");
  const pink = new THREE.Color("#f25cc7"), gold = new THREE.Color("#ffb829"), deepGold = new THREE.Color("#ff9a3d");
  const R = 1.25;                 // board half-diagonal
  const BOARD_Y = 0.32, SKULL_TOP = 0.3, SKULL_BOT = -0.3;
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let k: Part;
    if (r < 0.42) k = "board"; else if (r < 0.52) k = "rim"; else if (r < 0.8) k = "skull";
    else if (r < 0.83) k = "button"; else if (r < 0.89) k = "cord"; else k = "tassel";
    kind[i] = k; a[i] = Math.random(); b[i] = Math.random(); c[i] = Math.random();
    if (k === "board" || k === "rim") {
      // colour sweeps across the board's diagonal (left/back corner teal → right/front corner violet)
      tmp.copy(teal).lerp(blue, Math.min(1, a[i]! * 2)).lerp(violet, Math.max(0, a[i]! * 2 - 1));
    } else if (k === "skull") tmp.copy(violet).lerp(pink, b[i]!);
    else if (k === "button") tmp.copy(gold);
    else tmp.copy(gold).lerp(deepGold, b[i]!);
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  // board corners (a square turned 45°): right (+x), front (+z), left (−x), back (−z)
  const corner = (u: number, v: number): [number, number] => {
    // (u, v) in [0,1]² → point inside the diamond
    const x = (u - v) * R, z = (u + v - 1) * R;
    return [x, z];
  };
  const at = (i: number, t: number, o: Vec3) => {
    const k = kind[i]!, u = a[i]!, v = b[i]!, w = c[i]!;
    const lift = Math.sin(t * 0.9) * 0.025; // the whole cap floats a little
    if (k === "board") {
      const [x, z] = corner(u, v);
      o[0] = x; o[1] = BOARD_Y + lift + (w - 0.5) * 0.02; o[2] = z;
    } else if (k === "rim") {
      // the board's four edges, with a little thickness
      const e = Math.floor(w * 4), s = u;
      const pts: [number, number][] = [[R, 0], [0, R], [-R, 0], [0, -R]];
      const p0 = pts[e]!, p1 = pts[(e + 1) % 4]!;
      o[0] = p0[0] + (p1[0] - p0[0]) * s; o[2] = p0[1] + (p1[1] - p0[1]) * s;
      o[1] = BOARD_Y + lift - v * 0.07;
    } else if (k === "skull") {
      // a slightly flared band under the board (front half denser so it reads from the viewer's side)
      const ang = (v < 0.7 ? (u - 0.5) * Math.PI * 1.1 : u * Math.PI * 2) + Math.PI / 2;
      const h = w, rad = 0.62 + 0.06 * (1 - h);
      o[0] = Math.cos(ang) * rad; o[2] = Math.sin(ang) * rad * 0.9;
      o[1] = SKULL_BOT + (SKULL_TOP - SKULL_BOT) * h + lift;
    } else if (k === "button") {
      const ang = u * Math.PI * 2, rad = Math.sqrt(v) * 0.09;
      o[0] = Math.cos(ang) * rad; o[2] = Math.sin(ang) * rad; o[1] = BOARD_Y + 0.04 + lift;
    } else if (k === "cord") {
      // from the button across the board to the front-right edge
      const ex = R * 0.55, ez = R * 0.45;
      o[0] = ex * u + (v - 0.5) * 0.02; o[2] = ez * u + (w - 0.5) * 0.02; o[1] = BOARD_Y + 0.03 + lift;
    } else {
      // tassel: hangs from the board edge, flaring into a fringe at the bottom, swaying
      const sway = Math.sin(t * 1.4) * 0.12;
      const len = 0.85, y = u * len;
      const fringe = Math.max(0, (u - 0.62) / 0.38);
      const ang = v * Math.PI * 2, spread = 0.025 + fringe * 0.11;
      o[0] = R * 0.55 + Math.cos(ang) * spread + sway * u;
      o[2] = R * 0.45 + Math.sin(ang) * spread;
      o[1] = BOARD_Y - y + lift;
    }
  };
  return { col, at };
}

function introDone() {
  return document.documentElement.dataset.intro !== "playing";
}

/** `ambientOnly`: just the starfield + glow backdrop (no morphing object or controls) — used on inner pages. */
export default function ParticleMorph({ ambientOnly = false }: { ambientOnly?: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  // set by the animation loop; called by the arrow buttons and dots
  const jump = useRef<(dir: number) => void>(() => {});
  const pick = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    const el = mount.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = innerWidth < 768;
    const COUNT = ambientOnly ? 0 : small ? 4200 : 9000;
    const AMBIENT = small ? 45 : 90;

    // No WebGL (old GPU, disabled hardware acceleration, locked-down browser)? Skip the particles and
    // keep the CSS glow backdrop, instead of letting the error take down the whole page.
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = FOCUS;
    const object = new THREE.Group();
    scene.add(object);

    const font = getComputedStyle(document.body).fontFamily || "sans-serif";
    const { shapes, fold } = buildShapes(COUNT, font);

    /* ---------- object particles ---------- */
    const pos = new Float32Array(COUNT * 3);
    const rnd = new Float32Array(COUNT), size = new Float32Array(COUNT), rot = new Float32Array(COUNT);
    const scatter = new Float32Array(COUNT * 3), delay = new Float32Array(COUNT), side = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      rnd[i] = Math.random();
      size[i] = (small ? 12 : 12.5) + Math.random() * 3.5;
      rot[i] = (Math.random() - 0.5) * 0.9; // mostly upright, like the reference
      const r = 6 + Math.random() * 6, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
      scatter.set([r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b) - 2], i * 3);
      delay[i] = Math.random() * 0.6;
      side[i] = Math.random() < 0.5 ? -1 : 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
    geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("rot", new THREE.BufferAttribute(rot, 1));
    geo.setAttribute("fold", new THREE.BufferAttribute(fold, 1));
    const objUniforms = { uPx: { value: 1 }, uTime: { value: 0 }, uRadius: { value: 1 }, uGlobe: { value: 0 }, uLS: { value: 0 }, uFade: { value: 1 } };
    const objMat = new THREE.ShaderMaterial({
      vertexShader: OBJ_VERT, fragmentShader: FRAG, uniforms: objUniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    object.add(new THREE.Points(geo, objMat));

    /* ---------- ambient triangles (outside the object, with depth of field) ---------- */
    const PALETTE = ["#ffb829", "#ffd25e", "#8052ff", "#a98bff", "#2fd3b0", "#ff7a5c", "#f25cc7", "#ffffff"].map((c) => new THREE.Color(c));
    const aPos = new Float32Array(AMBIENT * 3), aCol = new Float32Array(AMBIENT * 3);
    const aSize = new Float32Array(AMBIENT), aRot = new Float32Array(AMBIENT), aRnd = new Float32Array(AMBIENT);
    const aBase: Vec3[] = [];
    for (let i = 0; i < AMBIENT; i++) {
      const c = PALETTE[i % PALETTE.length];
      aCol.set([c.r, c.g, c.b], i * 3);
      const near = Math.random() < 0.18; // a few big, soft triangles close to the camera
      aBase.push([(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, near ? 2 + Math.random() * 1.6 : -Math.random() * 4]);
      aSize[i] = near ? 24 + Math.random() * 18 : 10 + Math.random() * 14;
      aRot[i] = Math.random() * Math.PI * 2;
      aRnd[i] = Math.random();
    }
    const ambGeo = new THREE.BufferGeometry();
    ambGeo.setAttribute("position", new THREE.BufferAttribute(aPos, 3));
    ambGeo.setAttribute("color", new THREE.BufferAttribute(aCol, 3));
    ambGeo.setAttribute("size", new THREE.BufferAttribute(aSize, 1));
    ambGeo.setAttribute("rot", new THREE.BufferAttribute(aRot, 1));
    ambGeo.setAttribute("rnd", new THREE.BufferAttribute(aRnd, 1));
    const ambUniforms = { uPx: { value: 1 }, uTime: { value: 0 } };
    const ambMat = new THREE.ShaderMaterial({
      vertexShader: AMB_VERT, fragmentShader: FRAG, uniforms: ambUniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const ambient = new THREE.Points(ambGeo, ambMat);
    scene.add(ambient);

    /* ---------- Academics backdrop: a particle open book that gathers while #academics is on screen ---------- */
    const BOOK = ambientOnly ? 0 : small ? 2600 : 6000;
    const book = makeCap(BOOK);
    // mouse push: each particle's current offset from its place (springs back when the cursor leaves)
    const bDispX = new Float32Array(BOOK), bDispY = new Float32Array(BOOK);
    const mouseLocal = new THREE.Vector3();
    const bPos = new Float32Array(BOOK * 3), bScatter = new Float32Array(BOOK * 3);
    const bSize = new Float32Array(BOOK), bRot = new Float32Array(BOOK), bRnd = new Float32Array(BOOK);
    for (let i = 0; i < BOOK; i++) {
      const r = 3 + Math.random() * 4, a = Math.random() * Math.PI * 2, c = Math.acos(2 * Math.random() - 1);
      bScatter.set([r * Math.sin(c) * Math.cos(a), r * Math.sin(c) * Math.sin(a), r * Math.cos(c) - 1.5], i * 3);
      bSize[i] = (small ? 11 : 11.5) + Math.random() * 4;
      bRot[i] = (Math.random() - 0.5) * 0.9;
      bRnd[i] = Math.random();
    }
    const bookGeo = new THREE.BufferGeometry();
    bookGeo.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
    bookGeo.setAttribute("color", new THREE.BufferAttribute(book.col, 3));
    bookGeo.setAttribute("size", new THREE.BufferAttribute(bSize, 1));
    bookGeo.setAttribute("rot", new THREE.BufferAttribute(bRot, 1));
    bookGeo.setAttribute("rnd", new THREE.BufferAttribute(bRnd, 1));
    const bookUniforms = { uPx: { value: 1 }, uTime: { value: 0 }, uBook: { value: 0 } };
    const bookMat = new THREE.ShaderMaterial({
      vertexShader: BOOK_VERT, fragmentShader: FRAG, uniforms: bookUniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const bookGroup = new THREE.Group();
    const bookPts = new THREE.Points(bookGeo, bookMat);
    bookPts.visible = false;
    bookGroup.add(bookPts);
    scene.add(bookGroup);
    const academics = document.getElementById("academics");

    // Drag to spin the cap: grab anywhere in Academics (not on links/buttons), drag sideways to spin,
    // up/down to tilt; it keeps turning with inertia when released, and the tilt eases back.
    let capDrag = -1, capLastX = 0, capLastY = 0, capYaw = 0, capPitch = 0, capV = 0;
    const onCapDown = (e: PointerEvent) => {
      if (!academics || e.button !== 0 || (e.target as Element)?.closest?.("a,button")) return;
      capDrag = e.pointerId; capLastX = e.clientX; capLastY = e.clientY; capV = 0;
      try { academics.setPointerCapture(e.pointerId); } catch { /* pointer already gone: drag still works while over the section */ }
      academics.style.cursor = "grabbing";
      e.preventDefault(); // no text selection while spinning
    };
    const onCapMove = (e: PointerEvent) => {
      if (e.pointerId !== capDrag) return;
      const dx = e.clientX - capLastX, dy = e.clientY - capLastY;
      capLastX = e.clientX; capLastY = e.clientY;
      capV = dx * 0.01; capYaw += capV;
      capPitch = Math.max(-0.8, Math.min(0.8, capPitch + dy * 0.006));
    };
    const onCapUp = (e: PointerEvent) => {
      if (e.pointerId !== capDrag || !academics) return;
      capDrag = -1;
      if (academics.hasPointerCapture(e.pointerId)) academics.releasePointerCapture(e.pointerId);
      academics.style.cursor = "";
    };
    if (academics && BOOK) {
      academics.classList.add("cap-draggable");
      academics.addEventListener("pointerdown", onCapDown);
      academics.addEventListener("pointermove", onCapMove);
      academics.addEventListener("pointerup", onCapUp);
      academics.addEventListener("pointercancel", onCapUp);
    }
    let heroGone = 0; // eased 0..1: hero object hidden for good once you scroll past Academics
    let bookShown = 0; // eased 0..1 so it gathers/dissolves smoothly instead of tracking scroll jitter

    /* ---------- layout: big object bleeding off the right edge on desktop ---------- */
    let halfW = 1, halfH = 1, baseX = 0, baseY = 0, baseScale = 1;
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      halfW = halfH * camera.aspect;
      const wide = w >= 900;
      const scale = wide ? Math.min(halfH * 0.95, halfW * 0.5) : Math.min(halfW * 0.62, halfH * 0.3);
      baseX = wide ? halfW * 0.4 : 0;
      baseY = wide ? -0.05 : halfH * 0.45;
      baseScale = scale;
      const px = h * renderer.getPixelRatio() * 0.0042;
      objUniforms.uPx.value = px;
      ambUniforms.uPx.value = px;
      bookUniforms.uPx.value = px;
      bookGroup.scale.setScalar(Math.min(halfH * 0.7, halfW * 0.48));
      objUniforms.uRadius.value = scale * 1.25;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let mx = 0, my = 0, tx = 0, ty = 0;
    let mouseActive = false; // a real mouse is over the page (touch never pushes particles)

    // Drag to rotate: grab the object (right side of the hero on desktop, top half on phones)
    // and spin it; it keeps turning with inertia when released, and tilt eases back to level.
    const hero = el.closest<HTMLElement>(".hero");
    let dragging = -1, lastX = 0, lastY = 0, yaw = 0, pitch = 0, vYaw = 0;
    const inGrabZone = (x: number, y: number) =>
      scrollY < innerHeight * 0.6 && (innerWidth >= 900 ? x > innerWidth * 0.42 : y < innerHeight * 0.5);
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5;
      mouseActive = e.pointerType === "mouse";
      if (e.pointerId === dragging) {
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        vYaw = dx * 0.009;
        yaw += vYaw;
        pitch = Math.max(-0.9, Math.min(0.9, pitch + dy * 0.006));
      } else if (hero && e.pointerType === "mouse") {
        const over = !(e.target as Element)?.closest?.("a,button") && inGrabZone(e.clientX, e.clientY);
        hero.style.cursor = over ? "grab" : "";
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as Element)?.closest?.("a,button") || !inGrabZone(e.clientX, e.clientY)) return;
      dragging = e.pointerId; lastX = e.clientX; lastY = e.clientY; vYaw = 0;
      hero?.setPointerCapture(e.pointerId);
      if (hero) hero.style.cursor = "grabbing";
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== dragging) return;
      dragging = -1;
      if (hero) { if (hero.hasPointerCapture(e.pointerId)) hero.releasePointerCapture(e.pointerId); hero.style.cursor = "grab"; }
    };
    addEventListener("pointermove", onMove);
    const onLeave = (e: PointerEvent) => { if (!e.relatedTarget) mouseActive = false; };
    document.addEventListener("pointerout", onLeave);
    hero?.addEventListener("pointerdown", onDown);
    hero?.addEventListener("pointerup", onUp);
    hero?.addEventListener("pointercancel", onUp);

    const out: Vec3 = [0, 0, 0], q: Vec3 = [0, 0, 0];
    let start = -1, raf = 0, lastStage = 0;
    const ease = (f: number) => (f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2);

    // Shape timeline: hold `cur`, then refold to `next`. Auto-advances; the arrows/dots jump.
    const N = shapes.length;
    let cur = 0, next = 0, holdStart = ASSEMBLE, moveStart = -1, t = 0;
    let holdFor = HOLD; // a manual pick is held longer before auto-advance resumes
    const goTo = (target: number) => {
      target = ((target % N) + N) % N;
      if (moveStart >= 0) { cur = next; moveStart = -1; } // finish any refold in progress instantly
      if (target === cur) return;
      next = target; moveStart = Math.max(t, ASSEMBLE); holdFor = HOLD * 2.5;
    };
    jump.current = (dir) => goTo((moveStart >= 0 ? next : cur) + dir);
    pick.current = (i) => goTo(i);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (start < 0) { if (!introDone()) return; start = now; }
      t = reduced ? ASSEMBLE + 1 + (now - start) / 1000 : (now - start) / 1000;
      objUniforms.uTime.value = t;
      ambUniforms.uTime.value = now / 1000;

      // auto-advance after the hold; finish a refold when it completes
      if (moveStart < 0 && t - holdStart > holdFor && !reduced) { next = (cur + 1) % N; moveStart = t; holdFor = HOLD; }
      let f = 0;
      if (moveStart >= 0) {
        const k = (t - moveStart) / (reduced ? 0.01 : MOVE);
        if (k >= 1) { cur = next; moveStart = -1; holdStart = t; } else f = ease(Math.max(k, 0));
      }
      const a = cur, b = moveStart >= 0 ? next : cur;
      const show = f > 0.5 ? b : a;
      const w = (idx: number) => (a === idx ? 1 - f : 0) + (b === idx ? f : 0);
      objUniforms.uGlobe.value = w(GLOBE_INDEX);
      objUniforms.uLS.value = w(0);
      if (show !== lastStage) { lastStage = show; setStage(show); }

      for (let i = 0; i < COUNT; i++) {
        shapes[a](i, t, out);
        if (f > 0) {
          shapes[b](i, t, q);
          const lift = Math.sin(f * Math.PI) * 0.22 * side[i]; // swarm bulges outward mid-fold
          out[0] += (q[0] - out[0]) * f;
          out[1] += (q[1] - out[1]) * f;
          out[2] += (q[2] - out[2]) * f + lift;
        }
        const g = Math.min(Math.max((t - delay[i]) / (ASSEMBLE - 0.6), 0), 1), e = 1 - Math.pow(1 - g, 3);
        const j = i * 3;
        pos[j] = scatter[j] + (out[0] - scatter[j]) * e;
        pos[j + 1] = scatter[j + 1] + (out[1] - scatter[j + 1]) * e;
        pos[j + 2] = scatter[j + 2] + (out[2] - scatter[j + 2]) * e;
      }
      geo.attributes.position.needsUpdate = true;

      for (let i = 0; i < AMBIENT; i++) {
        const p = aBase[i], depth = (FOCUS - p[2]) / FOCUS; // spread to fill the view at each depth
        aPos[i * 3] = p[0] * halfW * 1.1 * depth;
        aPos[i * 3 + 1] = p[1] * halfH * 1.1 * depth + Math.sin(now / 2600 + i) * 0.05;
        aPos[i * 3 + 2] = p[2];
      }
      ambGeo.attributes.position.needsUpdate = true;

      tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05;
      const s = reduced ? 0 : now / 1000;
      // The canvas is fixed behind the whole site. Past the hero the object recedes (smaller, up and to
      // the right, mostly transparent) so later sections keep the same starfield backdrop.
      const scrolled = Math.min(Math.max(scrollY / (innerHeight * 0.9), 0), 1);
      const leave = scrolled * scrolled * (3 - 2 * scrolled);
      // fully hidden while the Academics book is showing, so the two never compete
      // once Academics has been reached the hero object stays gone, so it never sits behind later sections
      const pastAcad = academics ? academics.getBoundingClientRect().top < innerHeight * 0.5 : false;
      heroGone += ((pastAcad ? 1 : 0) - heroGone) * (reduced ? 1 : 0.06);
      objUniforms.uFade.value = (1 - 0.96 * leave) * (1 - bookShown) * (1 - heroGone);
      object.scale.setScalar(baseScale * (1 - 0.3 * leave));
      object.position.set(baseX + halfW * 0.38 * leave, baseY + Math.sin(s * 0.8) * 0.05 + halfH * 0.18 * leave, 0);
      if (dragging < 0) { yaw += vYaw; vYaw *= 0.95; pitch *= 0.97; } // inertia, then settle
      object.rotation.set(0.12 + ty * 0.4 + pitch, Math.sin(s * 0.3) * 0.3 + tx * 0.8 + yaw, 0);
      ambient.position.set(-tx * 0.25, ty * 0.18, 0); // parallax: near triangles drift against the mouse
      if (BOOK && academics) {
        const r = academics.getBoundingClientRect();
        const filled = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / innerHeight;
        const target = Math.min(1, Math.max(0, (filled - 0.15) / 0.45));
        bookShown += (target - bookShown) * (reduced ? 1 : 0.06);
        const e = bookShown * bookShown * (3 - 2 * bookShown);
        bookUniforms.uBook.value = e;
        bookUniforms.uTime.value = now / 1000;
        bookPts.visible = e > 0.002;
        if (bookPts.visible) {
          // where the cursor is, in the mark's own space (on the plane the mark sits in)
          const dist = FOCUS - bookGroup.position.z;
          mouseLocal.set(mx * 2 * halfW * (dist / FOCUS), -my * 2 * halfH * (dist / FOCUS), bookGroup.position.z);
          bookGroup.updateMatrixWorld();
          bookGroup.worldToLocal(mouseLocal);
          const bt = reduced ? 0 : now / 1000;
          for (let i = 0; i < BOOK; i++) {
            book.at(i, bt, out);
            // push particles away from the cursor, then let them spring back
            const dx = out[0] - mouseLocal.x, dy = out[1] - mouseLocal.y, d2 = dx * dx + dy * dy;
            let px = 0, py = 0;
            if (mouseActive && d2 < 0.16) {
              const d = Math.sqrt(d2) || 0.0001, f = (1 - d / 0.4) * 0.28;
              px = (dx / d) * f; py = (dy / d) * f;
            }
            bDispX[i] = bDispX[i]! + (px - bDispX[i]!) * 0.12;
            bDispY[i] = bDispY[i]! + (py - bDispY[i]!) * 0.12;
            out[0] += bDispX[i]!; out[1] += bDispY[i]!;
            const j = i * 3;
            bPos[j] = bScatter[j]! + (out[0] - bScatter[j]!) * e;
            bPos[j + 1] = bScatter[j + 1]! + (out[1] - bScatter[j + 1]!) * e;
            bPos[j + 2] = bScatter[j + 2]! + (out[2] - bScatter[j + 2]!) * e;
          }
          bookGeo.attributes.position.needsUpdate = true;
          // centred behind the timeline, seen a little from above, swaying slowly; drifts with scroll
          const centre = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          bookGroup.position.set(0, Math.max(-0.6, Math.min(0.6, centre * 0.25)) * halfH, -0.4);
          // turned to show the pages' depth, swaying slowly
          // tilts strongly towards the cursor (reacts to the mouse), with a slow idle sway
          // seen a little from above so the board's top shows; tilts strongly towards the cursor
          // tilted 18° (a relaxed lean that keeps the timeline readable); hover tilt, drag spin and idle sway on top
          if (capDrag < 0) { capYaw += capV; capV *= 0.95; capPitch *= 0.97; } // inertia, then settle
          bookGroup.rotation.set(
            0.42 + ty * 0.8 + capPitch,
            -0.35 + Math.sin(bt * 0.3) * 0.2 + tx * 1.1 + capYaw,
            THREE.MathUtils.degToRad(18),
          );
        }
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      academics?.removeEventListener("pointerdown", onCapDown);
      academics?.removeEventListener("pointermove", onCapMove);
      academics?.removeEventListener("pointerup", onCapUp);
      academics?.removeEventListener("pointercancel", onCapUp);
      hero?.removeEventListener("pointerdown", onDown);
      hero?.removeEventListener("pointerup", onUp);
      hero?.removeEventListener("pointercancel", onUp);
      ro.disconnect();
      bookGeo.dispose(); bookMat.dispose();
      geo.dispose(); ambGeo.dispose(); objMat.dispose(); ambMat.dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, [ambientOnly]);

  return (
    <>
      <div ref={mount} className="particle-stage" aria-hidden="true" />
      {!ambientOnly && (
      <div className="morph-controls reveal" role="group" aria-label="Change the 3D shape">
        <em aria-live="polite">{SHAPE_NAMES[stage]}</em>
        <div className="morph-dots">
          {SHAPE_NAMES.map((n, i) => (
            <button
              key={n}
              type="button"
              className={i === stage ? "on" : undefined}
              aria-label={`Show ${n}`}
              aria-pressed={i === stage}
              onClick={() => pick.current(i)}
            />
          ))}
        </div>
        <button type="button" className="morph-arrow" aria-label="Previous shape" onClick={() => jump.current(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" className="morph-arrow" aria-label="Next shape" onClick={() => jump.current(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      )}
    </>
  );
}
