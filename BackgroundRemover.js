'use client';
import { useEffect, useRef, useState } from 'react';
import FileDrop from './FileDrop';
import { baseName, loadImage, toBlob, saveBlob } from '../lib/image';
import { computeAlpha, detectBg } from '../lib/bgremove';

const MAXPX = 3000;
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

export default function BackgroundRemover() {
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('image');
  const [info, setInfo] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [tol, setTol] = useState(35);
  const [soft, setSoft] = useState(25);
  const [everywhere, setEverywhere] = useState(false);
  const [tool, setTool] = useState('pick');
  const [brush, setBrush] = useState(40);
  const [prevBg, setPrevBg] = useState('transparent');
  const [ver, setVer] = useState(0);
  const cv = useRef(null);
  const st = useRef(null);
  const drawing = useRef(false);
  const last = useRef([0, 0]);

  // combine automatic result + manual brush edits into the visible picture
  const compose = (x0, y0, x1, y1) => {
    const s = st.current;
    if (!s || !cv.current) return;
    const { w, src, auto, manual, out, bg } = s;
    const o = out.data;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const p = y * w + x, i = p * 4, sa = src[i + 3], m = manual[p];
        const a = m === 1 ? 0 : m === 2 ? sa : Math.min(auto[p], sa);
        let r = src[i], g = src[i + 1], b = src[i + 2];
        if (m !== 2 && a > 0 && a < 255 && sa === 255) {
          // remove the background colour that bleeds into soft edges
          const k = a / 255;
          r = clamp((r - bg[0] * (1 - k)) / k);
          g = clamp((g - bg[1] * (1 - k)) / k);
          b = clamp((b - bg[2] * (1 - k)) / k);
        }
        o[i] = r; o[i + 1] = g; o[i + 2] = b; o[i + 3] = a;
      }
    }
    cv.current.getContext('2d').putImageData(out, 0, 0, x0, y0, x1 - x0, y1 - y0);
  };

  const open = async (list) => {
    const file = Array.from(list || []).find((f) => /^image\//.test(f.type));
    if (!file) { setMsg('Please choose an image file (JPG, PNG or WebP).'); return; }
    setMsg(''); setBusy(true);
    try {
      const { img, w, h, done } = await loadImage(file);
      const s = Math.min(1, MAXPX / Math.max(w, h));
      const cw = Math.round(w * s), ch = Math.round(h * s);
      const c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0, cw, ch);
      done();
      const src = x.getImageData(0, 0, cw, ch).data;
      st.current = {
        w: cw, h: ch, src,
        auto: new Uint8ClampedArray(cw * ch).fill(255),
        manual: new Uint8Array(cw * ch),
        out: new ImageData(new Uint8ClampedArray(src), cw, ch),
        bg: detectBg(src, cw, ch), seed: null,
      };
      setName(baseName(file.name));
      setInfo(cw + ' x ' + ch + ' px');
      setLoaded(true);
      setVer((v) => v + 1);
    } catch (e) {
      setMsg('Could not open this image.');
    }
    setBusy(false);
  };

  // run the automatic removal whenever a setting changes
  useEffect(() => {
    if (!loaded || !st.current || !cv.current) return;
    const t = setTimeout(() => {
      const s = st.current;
      if (cv.current.width !== s.w) { cv.current.width = s.w; cv.current.height = s.h; }
      s.auto = computeAlpha(s.src, s.w, s.h, s.bg, tol, tol + Math.max(soft, 1), everywhere, s.seed);
      compose(0, 0, s.w, s.h);
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, tol, soft, everywhere, ver]);

  const point = (e) => {
    const r = cv.current.getBoundingClientRect();
    const s = st.current;
    return [((e.clientX - r.left) * s.w) / r.width, ((e.clientY - r.top) * s.h) / r.height];
  };
  const dab = (cx, cy) => {
    const s = st.current;
    const r = cv.current.getBoundingClientRect();
    const rad = ((brush / 2) * s.w) / r.width;
    const x0 = Math.max(0, Math.floor(cx - rad)), x1 = Math.min(s.w, Math.ceil(cx + rad));
    const y0 = Math.max(0, Math.floor(cy - rad)), y1 = Math.min(s.h, Math.ceil(cy + rad));
    const val = tool === 'erase' ? 1 : 2;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= rad * rad) s.manual[y * s.w + x] = val;
      }
    }
    compose(x0, y0, x1, y1);
  };
  const stroke = (ax, ay, bx, by) => {
    const s = st.current;
    const r = cv.current.getBoundingClientRect();
    const rad = ((brush / 2) * s.w) / r.width;
    const d = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.ceil(d / Math.max(1, rad / 2)));
    for (let k = 1; k <= n; k++) dab(ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n);
  };
  const down = (e) => {
    if (!st.current) return;
    e.preventDefault();
    const [x, y] = point(e);
    const s = st.current;
    if (tool === 'pick') {
      const px = Math.min(s.w - 1, Math.max(0, Math.floor(x)));
      const py = Math.min(s.h - 1, Math.max(0, Math.floor(y)));
      const i = (py * s.w + px) * 4;
      s.bg = [s.src[i], s.src[i + 1], s.src[i + 2]];
      s.seed = [px, py];
      setVer((v) => v + 1);
      return;
    }
    drawing.current = true;
    last.current = [x, y];
    cv.current.setPointerCapture(e.pointerId);
    dab(x, y);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const [x, y] = point(e);
    stroke(last.current[0], last.current[1], x, y);
    last.current = [x, y];
  };
  const up = () => { drawing.current = false; };

  const resetBrush = () => { const s = st.current; s.manual.fill(0); compose(0, 0, s.w, s.h); };
  const resetAll = () => { const s = st.current; s.manual.fill(0); s.seed = null; s.bg = detectBg(s.src, s.w, s.h); setTol(35); setSoft(25); setEverywhere(false); setVer((v) => v + 1); };

  const download = async () => {
    const s = st.current;
    const t = document.createElement('canvas');
    t.width = s.w; t.height = s.h;
    const tx = t.getContext('2d');
    if (prevBg !== 'transparent') { tx.fillStyle = prevBg; tx.fillRect(0, 0, s.w, s.h); }
    const o = document.createElement('canvas');
    o.width = s.w; o.height = s.h;
    o.getContext('2d').putImageData(s.out, 0, 0);
    tx.drawImage(o, 0, 0);
    saveBlob(await toBlob(t, 'image/png'), name + '-no-bg.png');
  };

  if (!loaded) {
    return (
      <div className="pj">
        <FileDrop onFiles={open} accept="image/png,image/jpeg,image/webp" multiple={false}
          title="Drop an image to remove its background" text="JPG, PNG or WebP. Works best on plain or evenly coloured backgrounds."
          button={busy ? 'Opening...' : 'Select Image'} icon="bg" />
        {msg && <p className="pj-msg">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="pj">
      <div className="bg-top">
        <div><b>{name}</b> <span className="pj-st">{info}</span></div>
        <div className="pj-act">
          <button className="btn o" onClick={() => { setLoaded(false); st.current = null; }}>New image</button>
          <button className="btn" onClick={download}>Download PNG</button>
        </div>
      </div>

      <div className={'bg-stage' + (prevBg === 'transparent' ? ' chk' : '')} style={prevBg !== 'transparent' ? { background: prevBg } : undefined}>
        <canvas ref={cv} className={'bg-cv ' + tool} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
      </div>

      <div className="pj-opts">
        <div className="pj-opt">
          <label>Tool</label>
          <div className="pj-seg">
            {[['pick', 'Pick background'], ['erase', 'Erase'], ['restore', 'Restore']].map(([v, t]) => (
              <button key={v} className={tool === v ? 'on' : ''} onClick={() => setTool(v)}>{t}</button>
            ))}
          </div>
          <small>{tool === 'pick' ? 'Click on the background to choose which colour is removed.' : tool === 'erase' ? 'Paint over parts you want to remove.' : 'Paint over parts you want to bring back.'}</small>
        </div>
        <div className="pj-opt">
          <label htmlFor="bs">Brush size <b>{brush}px</b></label>
          <input id="bs" type="range" min="8" max="120" value={brush} onChange={(e) => setBrush(+e.target.value)} />
          <button className="pj-link" onClick={resetBrush}>Undo all brush edits</button>
        </div>
        <div className="pj-opt">
          <label htmlFor="bt">Colour tolerance <b>{tol}</b></label>
          <input id="bt" type="range" min="5" max="150" value={tol} onChange={(e) => setTol(+e.target.value)} />
          <small>Increase if some background is left. Decrease if the subject is getting cut.</small>
        </div>
        <div className="pj-opt">
          <label htmlFor="bf">Edge softness <b>{soft}</b></label>
          <input id="bf" type="range" min="0" max="80" value={soft} onChange={(e) => setSoft(+e.target.value)} />
          <label className="pj-chk"><input type="checkbox" checked={everywhere} onChange={(e) => setEverywhere(e.target.checked)} /> Remove this colour everywhere (also holes inside)</label>
        </div>
      </div>

      <div className="pj-opt" style={{ marginTop: 18 }}>
        <label>Preview and download background</label>
        <div className="pj-sw">
          <button type="button" className={'chk' + (prevBg === 'transparent' ? ' on' : '')} onClick={() => setPrevBg('transparent')} aria-label="Transparent" />
          {['#ffffff', '#000000', '#22D3EE', '#4F46E5'].map((c) => (
            <button key={c} type="button" style={{ background: c }} className={prevBg === c ? 'on' : ''} onClick={() => setPrevBg(c)} aria-label={'Background ' + c} />
          ))}
          <input type="color" value={prevBg === 'transparent' ? '#ffffff' : prevBg} onChange={(e) => setPrevBg(e.target.value)} aria-label="Custom colour" />
          <button className="pj-link" onClick={resetAll}>Reset everything</button>
        </div>
      </div>
      {msg && <p className="pj-msg">{msg}</p>}
    </div>
  );
}
