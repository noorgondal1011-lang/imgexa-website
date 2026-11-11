'use client';
import { useEffect, useRef, useState } from 'react';
import { makeZip } from '../lib/zip';
import { fmt } from '../lib/img';

const MAX_FILES = 50;

/*
  Generic multi-image tool: drop zone, options area, live results list, single download and ZIP download.
  process(file) must return { blob, w, h }. It is called again for every file when files or depKey change.
*/
export default function BatchTool({ valid, accept, dropTitle, dropHint, btnLabel, options, depKey, process, outName, zipName }) {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [drag, setDrag] = useState(false);
  const inp = useRef(null);
  const run = useRef(0);
  const urls = useRef([]);
  const counter = useRef(0);
  const proc = useRef(process);
  proc.current = process;

  const addFiles = (list) => {
    const all = Array.from(list || []);
    const ok = all.filter(valid);
    const bad = all.length - ok.length;
    setFiles((prev) => {
      const room = MAX_FILES - prev.length;
      const take = ok.slice(0, Math.max(room, 0)).map((file) => ({ id: ++counter.current, file }));
      const parts = [];
      if (bad) parts.push(bad + ' file(s) skipped: unsupported format.');
      if (ok.length > room) parts.push('Maximum ' + MAX_FILES + ' images at a time.');
      setMsg(parts.join(' '));
      return [...prev, ...take];
    });
  };

  useEffect(() => {
    if (!files.length) { setResults({}); setBusy(false); return; }
    const id = ++run.current;
    setBusy(true);
    const t = setTimeout(async () => {
      const next = {};
      const fresh = [];
      for (const f of files) {
        try {
          const r = await proc.current(f.file);
          if (id !== run.current) { fresh.forEach(URL.revokeObjectURL); return; }
          const url = URL.createObjectURL(r.blob);
          fresh.push(url);
          next[f.id] = { ...r, url };
        } catch (e) {
          next[f.id] = { error: true };
        }
      }
      if (id !== run.current) { fresh.forEach(URL.revokeObjectURL); return; }
      urls.current.forEach(URL.revokeObjectURL);
      urls.current = fresh;
      setResults(next);
      setBusy(false);
    }, 250);
    return () => clearTimeout(t);
  }, [files, depKey]);

  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);

  const downloadAll = async () => {
    const used = {};
    const entries = [];
    for (const f of files) {
      const r = results[f.id];
      if (!r || r.error) continue;
      let name = outName(f.file, r);
      if (used[name]) { used[name]++; name = name.replace(/(\.[^.]+)$/, '-' + used[name] + '$1'); } else used[name] = 1;
      entries.push({ name, data: new Uint8Array(await r.blob.arrayBuffer()) });
    }
    if (!entries.length) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(makeZip(entries));
    a.download = zipName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  const done = files.filter((f) => results[f.id] && !results[f.id].error);
  const totalIn = done.reduce((s, f) => s + f.file.size, 0);
  const totalOut = done.reduce((s, f) => s + results[f.id].blob.size, 0);

  return (
    <div className="pj">
      <div
        className={'pj-drop' + (drag ? ' on' : '')}
        onClick={() => inp.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        role="button" tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inp.current.click()}
      >
        <div className="pj-ic"><svg className="i"><use href="#zip" /></svg></div>
        <h3>{dropTitle}</h3>
        <p>{dropHint} Up to {MAX_FILES} images at once.</p>
        <span className="btn">{btnLabel}</span>
        <input ref={inp} type="file" accept={accept} multiple hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
      </div>
      {msg && <p className="pj-msg">{msg}</p>}

      <div className="pj-opts">{options}</div>

      {files.length > 0 && (
        <div className="pj-list">
          <div className="pj-bar">
            <div>
              <b>{files.length} image{files.length > 1 ? 's' : ''}</b>
              {busy ? <span className="pj-st"> Processing...</span>
                : done.length > 0 && <span className="pj-st"> {fmt(totalIn)} to {fmt(totalOut)}</span>}
            </div>
            <div className="pj-act">
              <button className="btn o" onClick={() => inp.current.click()}>Add more</button>
              <button className="btn o" onClick={() => { setFiles([]); setMsg(''); }}>Clear all</button>
              <button className="btn" onClick={downloadAll} disabled={busy || !done.length}>Download All (ZIP)</button>
            </div>
          </div>
          {files.map((f) => {
            const r = results[f.id];
            const ok = r && !r.error;
            const pct = ok ? Math.round((1 - r.blob.size / f.file.size) * 100) : 0;
            const name = ok ? outName(f.file, r) : f.file.name;
            return (
              <div className="pj-row" key={f.id}>
                <div className="pj-th">{ok ? <img src={r.url} alt={name} /> : <span className="pj-sp" />}</div>
                <div className="pj-in">
                  <b>{name}</b>
                  {r && r.error ? <small className="bad">Could not process this file.</small>
                    : ok ? <small>{r.w} x {r.h} px &nbsp;|&nbsp; {fmt(f.file.size)} to <b>{fmt(r.blob.size)}</b>
                        <em className={pct >= 0 ? 'good' : 'bad'}>{pct >= 0 ? '-' + pct + '%' : '+' + Math.abs(pct) + '%'}</em>
                        {r.note && <span className="pj-note"> {r.note}</span>}</small>
                    : <small>Processing...</small>}
                </div>
                {ok && <a className="btn pj-dl" href={r.url} download={name}>Download</a>}
                <button className="pj-x" onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))} aria-label="Remove">&times;</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
