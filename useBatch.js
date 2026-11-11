import { useEffect, useRef, useState } from 'react';

// Runs fn(fileItem) for every file and re-runs when the files or the settings (deps) change.
export function useBatch(files, deps, fn) {
  const [results, setResults] = useState({});
  const [busy, setBusy] = useState(false);
  const run = useRef(0);
  const urls = useRef([]);
  const key = JSON.stringify(deps);

  useEffect(() => {
    if (!files.length) { setResults({}); setBusy(false); return; }
    const id = ++run.current;
    setBusy(true);
    const t = setTimeout(async () => {
      const next = {};
      const fresh = [];
      for (const f of files) {
        try {
          const r = await fn(f);
          if (id !== run.current) { fresh.forEach(URL.revokeObjectURL); return; }
          r.url = URL.createObjectURL(r.blob);
          fresh.push(r.url);
          next[f.id] = r;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, key]);

  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);
  return { results, busy };
}
