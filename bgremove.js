// Background removal for plain / evenly coloured backgrounds (runs fully in the browser).

// Most common colour along the image border = background colour.
export function detectBg(src, w, h) {
  const bins = new Map();
  const add = (p) => {
    const i = p * 4;
    const r = src[i], g = src[i + 1], b = src[i + 2];
    const k = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    let e = bins.get(k);
    if (!e) { e = [0, 0, 0, 0]; bins.set(k, e); }
    e[0]++; e[1] += r; e[2] += g; e[3] += b;
  };
  for (let x = 0; x < w; x++) { add(x); add((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { add(y * w); add(y * w + w - 1); }
  let best = null;
  bins.forEach((e) => { if (!best || e[0] > best[0]) best = e; });
  return [best[1] / best[0], best[2] / best[0], best[3] / best[0]];
}

// Returns an alpha value (0-255) for every pixel.
// hard = colour distance that is removed completely, softEnd = distance where the pixel is fully kept.
export function computeAlpha(src, w, h, bg, hard, softEnd, everywhere, seed) {
  const n = w * h;
  const alpha = new Uint8ClampedArray(n).fill(255);
  const dist = (p) => {
    const i = p * 4;
    const dr = src[i] - bg[0], dg = src[i + 1] - bg[1], db = src[i + 2] - bg[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };
  const ramp = (d) => (d <= hard ? 0 : d >= softEnd ? 255 : Math.round(((d - hard) / (softEnd - hard)) * 255));

  if (everywhere) {
    for (let p = 0; p < n; p++) { const d = dist(p); if (d < softEnd) alpha[p] = ramp(d); }
    return alpha;
  }
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sp = 0;
  const push = (p) => {
    if (seen[p]) return;
    const d = dist(p);
    if (d >= softEnd) return;
    seen[p] = 1;
    alpha[p] = ramp(d);
    stack[sp++] = p;
  };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  if (seed) push(seed[1] * w + seed[0]);
  while (sp) {
    const p = stack[--sp];
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (y > 0) push(p - w);
    if (y < h - 1) push(p + w);
  }
  return alpha;
}
