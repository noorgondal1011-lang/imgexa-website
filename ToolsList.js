'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  ['/png-to-jpg', 'Convert PNG to JPG'],
  ['/image-compressor', 'Image Compressor'],
  ['/image-resizer', 'Image Resizer'],
  ['/background-remover', 'Background Remover'],
  ['/jpg-to-png', 'JPG to PNG'],
  ['/webp-converter', 'Convert to WebP'],
];

export default function ToolsList() {
  const path = usePathname();
  const found = items.findIndex((i) => i[0] === path);
  const act = found < 0 ? 0 : found;
  const [hov, setHov] = useState(-1);
  const refs = useRef([]);
  const mk = useRef(null);
  const first = useRef(true);

  const place = (i) => {
    const l = refs.current[i];
    if (l && mk.current) mk.current.style.transform = `translateY(${l.offsetTop + l.offsetHeight / 2 - 5.5}px)`;
  };

  // marker follows the page that is open; slides when the page changes
  useEffect(() => {
    const m = mk.current;
    let t;
    if (first.current) {
      let prev = null;
      try { prev = sessionStorage.getItem('imgexaMk'); } catch (e) {}
      const start = prev !== null && refs.current[+prev] ? +prev : act;
      m.style.transition = 'none';
      place(start);
      m.offsetHeight;
      m.style.transition = '';
      first.current = false;
      t = setTimeout(() => place(act), 120);
    } else {
      place(act);
    }
    setHov(-1);
    try { sessionStorage.setItem('imgexaMk', act); } catch (e) {}
    return () => clearTimeout(t);
  }, [act]);

  useEffect(() => {
    const r = () => place(act);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, [act]);

  return (
    <ul className="tl" onMouseLeave={() => { place(act); setHov(-1); }}>
      <span className="mk" ref={mk} />
      {items.map(([href, label], i) => (
        <li key={href} ref={(el) => (refs.current[i] = el)} className={hov === i ? 'hv' : ''}
          onMouseEnter={() => { place(i); setHov(i); }}>
          <Link href={href}>{label}</Link>
        </li>
      ))}
    </ul>
  );
}
