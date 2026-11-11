'use client';
import { useRef, useState } from 'react';
import FileDrop from './FileDrop';
import ResultList from './ResultList';
import { useFiles } from '../lib/useFiles';
import { useBatch } from '../lib/useBatch';
import { EXT, fmt, baseName, isImage, loadImage, toBlob, downloadZip } from '../lib/image';

const PRESETS = [
  ['Instagram Post', 1080, 1080], ['Instagram Story', 1080, 1920], ['Facebook Cover', 820, 312],
  ['LinkedIn Banner', 1584, 396], ['YouTube Thumbnail', 1280, 720], ['X (Twitter) Post', 1200, 675],
  ['Pinterest Pin', 1000, 1500], ['WhatsApp Profile', 500, 500],
];
const LIMIT = 8192;

function target(w, h, o) {
  let tw = w, th = h;
  if (o.mode === 'percent') { tw = w * (o.percent / 100); th = h * (o.percent / 100); }
  else if (o.mode === 'preset') { tw = PRESETS[o.preset][1]; th = PRESETS[o.preset][2]; }
  else if (o.lock) {
    if (o.driver === 'w' && o.width > 0) { tw = o.width; th = (h * o.width) / w; }
    else if (o.driver === 'h' && o.height > 0) { th = o.height; tw = (w * o.height) / h; }
  } else { tw = o.width > 0 ? o.width : w; th = o.height > 0 ? o.height : h; }
  return [Math.min(LIMIT, Math.max(1, Math.round(tw))), Math.min(LIMIT, Math.max(1, Math.round(th)))];
}

async function resize(file, o) {
  const { img, w, h, done } = await loadImage(file);
  const [tw, th] = target(w, h, o);
  let type = o.format === 'original' ? file.type : o.format;
  if (!EXT[type]) type = 'image/png';
  const c = document.createElement('canvas');
  c.width = tw; c.height = th;
  const x = c.getContext('2d');
  if (type === 'image/jpeg') { x.fillStyle = '#ffffff'; x.fillRect(0, 0, tw, th); }
  x.imageSmoothingQuality = 'high';
  if (o.mode === 'preset') {
    // crop to fill the social media size, centred
    const s = Math.max(tw / w, th / h);
    const dw = w * s, dh = h * s;
    x.drawImage(img, (tw - dw) / 2, (th - dh) / 2, dw, dh);
  } else x.drawImage(img, 0, 0, tw, th);
  done();
  let blob = await toBlob(c, type, type === 'image/png' ? undefined : o.quality / 100);
  if (!blob || blob.type !== type) {
    const f = document.createElement('canvas');
    f.width = tw; f.height = th;
    const fx = f.getContext('2d');
    fx.fillStyle = '#ffffff'; fx.fillRect(0, 0, tw, th); fx.drawImage(c, 0, 0);
    type = 'image/jpeg';
    blob = await toBlob(f, type, o.quality / 100);
  }
  return { blob, type, w: tw, h: th, sw: w, sh: h };
}

export default function ImageResizer() {
  const { files, add, remove, clear, msg } = useFiles(isImage);
  const [mode, setMode] = useState('percent');
  const [percent, setPercent] = useState(50);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lock, setLock] = useState(true);
  const [driver, setDriver] = useState('w');
  const [preset, setPreset] = useState(0);
  const [format, setFormat] = useState('original');
  const [quality, setQuality] = useState(90);
  const more = useRef(null);

  const o = { mode, percent, width: +width || 0, height: +height || 0, lock, driver, preset, format, quality };
  const { results, busy } = useBatch(files, [o], (f) => resize(f.file, o));
  const nameOf = (f, r) => baseName(f.file.name) + '-' + r.w + 'x' + r.h + '.' + EXT[r.type];

  const first = files.length && results[files[0].id] && !results[files[0].id].error ? results[files[0].id] : null;
  const autoH = first && lock && driver === 'w' && o.width ? Math.round((first.sh * o.width) / first.sw) : '';
  const autoW = first && lock && driver === 'h' && o.height ? Math.round((first.sw * o.height) / first.sh) : '';

  return (
    <div className="pj">
      <FileDrop onFiles={add} accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp"
        title="Drop your images here" text="JPG, PNG and WebP supported. Resize up to 50 images at once."
        button="Select Images" icon="resize" />
      {msg && <p className="pj-msg">{msg}</p>}

      <div className="pj-opts one">
        <div className="pj-opt">
          <label>Resize by</label>
          <div className="pj-seg">
            {[['percent', 'Percentage'], ['pixels', 'Pixels'], ['preset', 'Social media size']].map(([v, t]) => (
              <button key={v} className={mode === v ? 'on' : ''} onClick={() => setMode(v)}>{t}</button>
            ))}
          </div>
        </div>

        {mode === 'percent' && (
          <div className="pj-opt">
            <label htmlFor="rp">Scale <b>{percent}%</b></label>
            <input id="rp" type="range" min="5" max="200" value={percent} onChange={(e) => setPercent(+e.target.value)} />
            <small>50% makes the image half as wide and half as tall. Ratio is always kept.</small>
          </div>
        )}

        {mode === 'pixels' && (
          <div className="pj-opt">
            <div className="pj-dim">
              <div><label htmlFor="rw">Width (px)</label>
                <input id="rw" className="pj-num" type="number" min="1" placeholder={autoW ? String(autoW) : 'Auto'}
                  value={lock && driver === 'h' ? '' : width} onChange={(e) => { setWidth(e.target.value); setDriver('w'); }} /></div>
              <button className={'pj-lock' + (lock ? ' on' : '')} onClick={() => setLock(!lock)} aria-label="Keep aspect ratio" title="Keep aspect ratio">
                <svg className="i"><use href="#lock" /></svg>
              </button>
              <div><label htmlFor="rh">Height (px)</label>
                <input id="rh" className="pj-num" type="number" min="1" placeholder={autoH ? String(autoH) : 'Auto'}
                  value={lock && driver === 'w' ? '' : height} onChange={(e) => { setHeight(e.target.value); setDriver('h'); }} /></div>
            </div>
            <small>{lock ? 'Ratio locked: enter width or height and the other side is calculated for every image.' : 'Ratio unlocked: the image is stretched to the exact size you enter.'}</small>
          </div>
        )}

        {mode === 'preset' && (
          <div className="pj-opt">
            <label htmlFor="rs">Choose a size</label>
            <select id="rs" className="pj-sel" value={preset} onChange={(e) => setPreset(+e.target.value)}>
              {PRESETS.map((p, i) => <option key={p[0]} value={i}>{p[0] + ' - ' + p[1] + ' x ' + p[2] + ' px'}</option>)}
            </select>
            <small>The image is cropped from the centre to fill this size exactly.</small>
          </div>
        )}

        <div className="pj-opts two">
          <div className="pj-opt">
            <label>Output format</label>
            <div className="pj-seg">
              {[['original', 'Same'], ['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP']].map(([v, t]) => (
                <button key={v} className={format === v ? 'on' : ''} onClick={() => setFormat(v)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="pj-opt">
            <label htmlFor="rq">Quality (JPG / WebP) <b>{quality}%</b></label>
            <input id="rq" type="range" min="40" max="100" value={quality} onChange={(e) => setQuality(+e.target.value)} />
          </div>
        </div>
      </div>

      <ResultList files={files} results={results} busy={busy} nameOf={nameOf}
        onAdd={() => more.current.click()} onClear={clear} onRemove={remove}
        onZip={() => downloadZip(files.filter((f) => results[f.id] && !results[f.id].error).map((f) => ({ name: nameOf(f, results[f.id]), blob: results[f.id].blob })), 'imgexa-resized-images.zip')}
        summary={(done) => done.length + ' resized, ' + fmt(done.reduce((s, f) => s + results[f.id].blob.size, 0)) + ' total'}
        line={(f, r) => (
          <small>{r.sw} x {r.sh} px to <b>{r.w} x {r.h} px</b> &nbsp;|&nbsp; {fmt(f.file.size)} to {fmt(r.blob.size)}</small>
        )} />
      <input ref={more} type="file" hidden multiple accept="image/png,image/jpeg,image/webp"
        onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
