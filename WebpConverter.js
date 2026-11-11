'use client';
import { useRef, useState } from 'react';
import FileDrop from './FileDrop';
import ResultList from './ResultList';
import { useFiles } from '../lib/useFiles';
import { useBatch } from '../lib/useBatch';
import { fmt, baseName, loadImage, toBlob, downloadZip } from '../lib/image';

const accepted = (f) => /^image\/(png|jpe?g|webp)$/.test(f.type) || /\.(png|jpe?g|webp)$/i.test(f.name);

async function toWebp(file, q, maxDim) {
  const { img, w, h, done } = await loadImage(file);
  const s = maxDim ? Math.min(1, maxDim / Math.max(w, h)) : 1;
  const cw = Math.max(1, Math.round(w * s));
  const ch = Math.max(1, Math.round(h * s));
  const c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  const x = c.getContext('2d');
  x.imageSmoothingQuality = 'high';
  x.drawImage(img, 0, 0, cw, ch); // transparency of PNG files is kept
  done();
  const blob = await toBlob(c, 'image/webp', q / 100);
  if (!blob || blob.type !== 'image/webp') throw new Error('webp');
  return { blob, w: cw, h: ch };
}

export default function WebpConverter() {
  const { files, add, remove, clear, msg } = useFiles(accepted);
  const [quality, setQuality] = useState(80);
  const [maxDim, setMaxDim] = useState(0);
  const more = useRef(null);
  const { results, busy } = useBatch(files, [quality, maxDim], (f) => toWebp(f.file, quality, maxDim));
  const nameOf = (f) => baseName(f.file.name) + '.webp';
  const failed = files.length > 0 && !busy && files.every((f) => results[f.id] && results[f.id].error);

  return (
    <div className="pj">
      <FileDrop onFiles={add} accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp"
        title="Drop your images here to convert to WebP" text="JPG and PNG supported. Convert up to 50 images at once."
        button="Select Images" icon="web" />
      {msg && <p className="pj-msg">{msg}</p>}
      {failed && <p className="pj-msg">Your browser could not create WebP files. Please use the latest Chrome, Edge or Firefox.</p>}

      <div className="pj-opts">
        <div className="pj-opt">
          <label htmlFor="wq">WebP quality <b>{quality}%</b></label>
          <input id="wq" type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(+e.target.value)} />
          <small>75 to 85 is a great balance of sharpness and small size.</small>
        </div>
        <div className="pj-opt">
          <label htmlFor="wm">Limit longest side</label>
          <select id="wm" className="pj-sel" value={maxDim} onChange={(e) => setMaxDim(+e.target.value)}>
            <option value={0}>Keep original dimensions</option>
            <option value={2560}>2560 px</option>
            <option value={1920}>1920 px (Full HD)</option>
            <option value={1280}>1280 px</option>
          </select>
          <small>PNG transparency is kept in WebP.</small>
        </div>
      </div>

      <ResultList files={files} results={results} busy={busy} nameOf={nameOf}
        onAdd={() => more.current.click()} onClear={clear} onRemove={remove}
        onZip={() => downloadZip(files.filter((f) => results[f.id] && !results[f.id].error).map((f) => ({ name: nameOf(f), blob: results[f.id].blob })), 'imgexa-webp-images.zip')}
        summary={(done) => {
          const a = done.reduce((s, f) => s + f.file.size, 0);
          const b = done.reduce((s, f) => s + results[f.id].blob.size, 0);
          return fmt(a) + ' to ' + fmt(b) + ' (' + (b <= a ? 'saved ' + Math.round((1 - b / a) * 100) : 'larger by ' + Math.round((b / a - 1) * 100)) + '%)';
        }}
        line={(f, r) => {
          const pct = Math.round((1 - r.blob.size / f.file.size) * 100);
          return (
            <small>{r.w} x {r.h} px &nbsp;|&nbsp; {fmt(f.file.size)} to <b>{fmt(r.blob.size)}</b>
              <em className={pct >= 0 ? 'good' : 'neu'}>{pct >= 0 ? '-' + pct + '%' : '+' + Math.abs(pct) + '%'}</em>
            </small>
          );
        }} />
      <input ref={more} type="file" hidden multiple accept="image/png,image/jpeg,image/webp"
        onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
