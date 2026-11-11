import { makeZip } from './zip';

export const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const fmt = (b) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB');
export const baseName = (n) => n.replace(/\.[^.]+$/, '');
export const isImage = (f) => /^image\/(png|jpe?g|webp)$/.test(f.type) || /\.(png|jpe?g|webp)$/i.test(f.name);

// Loads an image file. Call done() once you have finished drawing it.
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, w: img.naturalWidth, h: img.naturalHeight, done: () => URL.revokeObjectURL(url) });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load')); };
    img.src = url;
  });
}

export const toBlob = (canvas, type, quality) => new Promise((res) => canvas.toBlob(res, type, quality));

export function saveBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

// items: [{ name, blob }]  ->  downloads one ZIP file
export async function downloadZip(items, zipName) {
  const used = {};
  const entries = [];
  for (const it of items) {
    let name = it.name;
    if (used[name]) { used[name]++; name = name.replace(/(\.[^.]+)$/, '-' + used[name] + '$1'); } else used[name] = 1;
    entries.push({ name, data: new Uint8Array(await it.blob.arrayBuffer()) });
  }
  if (entries.length) saveBlob(makeZip(entries), zipName);
}
