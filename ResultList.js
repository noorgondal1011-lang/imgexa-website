'use client';

// Shared list of converted images (thumbnail, info, download, remove).
export default function ResultList({ files, results, busy, nameOf, line, onAdd, onClear, onRemove, onZip, summary }) {
  if (!files.length) return null;
  const done = files.filter((f) => results[f.id] && !results[f.id].error);
  return (
    <div className="pj-list">
      <div className="pj-bar">
        <div>
          <b>{files.length} image{files.length > 1 ? 's' : ''}</b>
          {busy ? <span className="pj-st"> Working...</span> : done.length > 0 && <span className="pj-st"> {summary(done)}</span>}
        </div>
        <div className="pj-act">
          <button className="btn o" onClick={onAdd}>Add more</button>
          <button className="btn o" onClick={onClear}>Clear all</button>
          <button className="btn" onClick={onZip} disabled={busy || !done.length}>Download All (ZIP)</button>
        </div>
      </div>
      {files.map((f) => {
        const r = results[f.id];
        const ok = r && !r.error;
        return (
          <div className="pj-row" key={f.id}>
            <div className="pj-th">{ok ? <img src={r.url} alt={nameOf(f, r)} /> : <span className="pj-sp" />}</div>
            <div className="pj-in">
              <b>{ok ? nameOf(f, r) : f.file.name}</b>
              {r && r.error ? <small className="bad">Could not process this file.</small> : ok ? line(f, r) : <small>Working...</small>}
            </div>
            {ok && <a className="btn pj-dl" href={r.url} download={nameOf(f, r)}>Download</a>}
            <button className="pj-x" onClick={() => onRemove(f.id)} aria-label="Remove">&times;</button>
          </div>
        );
      })}
    </div>
  );
}
