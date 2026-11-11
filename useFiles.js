import { useRef, useState } from 'react';

// Keeps the list of files the user added (with filter + maximum count).
export function useFiles(test, max = 50, what = 'images') {
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState('');
  const counter = useRef(0);

  const add = (list) => {
    const all = Array.from(list || []);
    const ok = all.filter(test);
    const room = Math.max(max - files.length, 0);
    const notes = [];
    if (all.length - ok.length > 0) notes.push(all.length - ok.length + ' file(s) skipped: unsupported format.');
    if (ok.length > room) notes.push('Maximum ' + max + ' ' + what + ' at a time.');
    setMsg(notes.join(' '));
    const take = ok.slice(0, room).map((file) => ({ id: ++counter.current, file }));
    if (take.length) setFiles((prev) => [...prev, ...take]);
  };
  const remove = (id) => setFiles((p) => p.filter((f) => f.id !== id));
  const clear = () => { setFiles([]); setMsg(''); };
  return { files, add, remove, clear, msg };
}
