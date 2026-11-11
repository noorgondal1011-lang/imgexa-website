'use client';
import { useRef, useState } from 'react';
import FileDrop from './FileDrop';
import ResultList from './ResultList';
import { useFiles } from '../lib/useFiles';
import { useBatch } from '../lib/useBatch';
import { EXT, fmt, baseName, isImage, loadImage, toBlob, downloadZip } from '../lib/image';

async function compress(file, q, format, maxDim) {
  const { img, w, h, done } = await loadImage(file);
  const s = maxDim ? Math.min(1, maxDim / Math.max(w, h)) : 1;
  const cw = Math.max(1, Math.round(w * s));
  const ch = Math.max(1, Math.round(h * s));
  let type = format === 'original' ? file.type : format;
  if (!EXT[type]) type = 'image/jpeg';
  const c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  const x = c.getContext('2d');
  if (type === 'image/jpeg') { x.fillStyle = '#ffffff'; x.fillRect(0, 0, cw, ch); }
  x.imageSmoothingQuality = 'high';
  x.drawImage(img, 0, 0, cw, ch);
  done();

  // PNG is lossless in the browser, so quality reduces the number of colours (smaller file, same look)
  if (type === 'image/png' && q < 100) {
    const levels = Math.round(8 + (q / 100) * (q / 100) * 248);
    const step = 255 / (levels - 1);
    const id = x.getImageData(0, 0, cw, ch);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.round(Math.round(d[i] / step) * step);
      d[i + 1] = Math.round(Math.round(d[i + 1] / step) * step);
      d[i + 2] = Math.round(Math.round(d[i + 2] / step) * step);
    }
    x.putImageData(id, 0, 0);
  }
  let blob = await toBlob(c, type, type === 'image/png' ? undefined : q / 100);
  if (!blob || blob.type !== type) {
    // this browser cannot export that format (older Safari + WebP): fall back to JPG
    const f = document.createElement('canvas');
    f.width = cw; f.height = ch;
    const fx = f.getContext('2d');
    fx.fillStyle = '#ffffff'; fx.fillRect(0, 0, cw, ch); fx.drawImage(c, 0, 0);
    type = 'image/jpeg';
    blob = await toBlob(f, type, q / 100);
  }
  if (format === 'original' && s === 1 && blob.size >= file.size) return { blob: file, type: file.type, w, h, kept: true };
  return { blob, type, w: cw, h: ch };
}

export default function ImageCompressor() {
  const { files, add, remove, clear, msg } = useFiles(isImage);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState('original');
  const [maxDim, setMaxDim] = useState(0);
  const more = useRef(null);

  const { results, busy } = useBatch(files, [quality, format, maxDim], (f) => compress(f.file, quality, format, maxDim));
  const nameOf = (f, r) => (r.kept ? f.file.name : baseName(f.file.name) + '-compressed.' + EXT[r.type]);

  return (
    <div className="pj">
      <FileDrop onFiles={add} accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp"
        title="Drop your images here" text="JPG, PNG and WebP supported. Compress up to 50 images at once."
        button="Select Images" icon="zip" />
      {msg && <p className="pj-msg">{msg}</p>}

      <div className="pj-opts">
        <div className="pj-opt">
          <label htmlFor="cq">Compression quality <b>{quality}%</b></label>
          <input id="cq" type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(+e.target.value)} />
          <small>70 to 80 gives a big size drop with almost no visible change.</small>
        </div>
        <div className="pj-opt">
          <label>Output format</label>
          <div className="pj-seg">
            {[['original', 'Same as original'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']].map(([v, t]) => (
              <button key={v} className={format === v ? 'on' : ''} onClick={() => setFormat(v)}>{t}</button>
            ))}
          </div>
          <small>For PNG files, WebP or JPG gives much smaller files than keeping PNG.</small>
        </div>
        <div className="pj-opt">
          <label htmlFor="md">Limit longest side</label>
          <select id="md" className="pj-sel" value={maxDim} onChange={(e) => setMaxDim(+e.target.value)}>
            <option value={0}>Keep original dimensions</option>
            <option value={4096}>4096 px</option>
            <option value={2560}>2560 px</option>
            <option value={1920}>1920 px (Full HD)</option>
            <option value={1280}>1280 px</option>
          </select>
          <small>Shrinking huge photos is the quickest way to save space.</small>
        </div>
      </div>

      <ResultList files={files} results={results} busy={busy} nameOf={nameOf}
        onAdd={() => more.current.click()} onClear={clear} onRemove={remove}
        onZip={() => downloadZip(files.filter((f) => results[f.id] && !results[f.id].error).map((f) => ({ name: nameOf(f, results[f.id]), blob: results[f.id].blob })), 'imgexa-compressed-images.zip')}
        summary={(done) => {
          const a = done.reduce((s, f) => s + f.file.size, 0);
          const b = done.reduce((s, f) => s + results[f.id].blob.size, 0);
          return fmt(a) + ' to ' + fmt(b) + ' (saved ' + Math.max(0, Math.round((1 - b / a) * 100)) + '%)';
        }}
        line={(f, r) => {
          const pct = Math.round((1 - r.blob.size / f.file.size) * 100);
          return (
            <small>{r.w} x {r.h} px &nbsp;|&nbsp; {fmt(f.file.size)} to <b>{fmt(r.blob.size)}</b>
              {r.kept ? <em className="good">Already optimized</em> : <em className={pct >= 0 ? 'good' : 'bad'}>{pct >= 0 ? '-' + pct + '%' : '+' + Math.abs(pct) + '%'}</em>}
            </small>
          );
        }} />
      <input ref={more} type="file" hidden multiple accept="image/png,image/jpeg,image/webp"
        onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
