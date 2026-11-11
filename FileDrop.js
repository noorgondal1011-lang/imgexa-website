'use client';
import { useRef, useState } from 'react';

export default function FileDrop({ onFiles, accept, multiple = true, title, text, button = 'Select Images', icon = 'zip' }) {
  const inp = useRef(null);
  const [drag, setDrag] = useState(false);
  return (
    <div
      className={'pj-drop' + (drag ? ' on' : '')}
      onClick={() => inp.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
      role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inp.current.click()}
    >
      <div className="pj-ic"><svg className="i"><use href={'#' + icon} /></svg></div>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="btn">{button}</span>
      <input ref={inp} type="file" accept={accept} multiple={multiple} hidden
        onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
