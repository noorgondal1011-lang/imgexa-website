'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const slides = [
  { tag: 'Free Online Image Tools', title: 'Convert PNG to JPG Online in One Click',
    text: 'Convert PNG to JPG online free, with sharp quality and smaller files. No signup, no watermark.',
    cta: 'Convert Now', href: '/png-to-jpg' },
  { tag: 'Image Compressor', title: 'Compress Image Without Losing Quality',
    text: 'Our free image compressor online cuts file size up to 90 percent while keeping every detail crisp.',
    cta: 'Compress Image', href: '/image-compressor' },
  { tag: 'Background Remover', title: 'Remove Background from Image Online',
    text: 'Get a clean transparent cutout in seconds with our free background remover, without signup.',
    cta: 'Remove Background', href: '/background-remover' },
];

export default function Hero() {
  const [n, setN] = useState(0);
  const [pos, setPos] = useState(50);

  useEffect(() => {
    const t = setInterval(() => setN((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [n]);

  return (
    <section className="hero">
      <div className="wrap hg">
        <div>
          <div className="slides">
            {slides.map((s, i) => (
              <div key={s.href} className={'slide' + (i === n ? ' on' : '')}>
                <span className="tag">{s.tag}</span>
                <h1>{s.title}</h1>
                <p>{s.text}</p>
                <Link className="btn w" href={s.href}>
                  {s.cta} <svg className="i"><use href="#arr" /></svg>
                </Link>
              </div>
            ))}
          </div>
          <div className="dots">
            {slides.map((s, i) => (
              <button key={s.href} className={i === n ? 'on' : ''} onClick={() => setN(i)} aria-label={'Slide ' + (i + 1)} />
            ))}
          </div>
          <div className="stats">
            <div><b>2M+</b><span>Images processed</span></div>
            <div><b>10+</b><span>Free tools</span></div>
            <div><b>0</b><span>Signup needed</span></div>
          </div>
        </div>

        <div className="cmp">
          <div className="cbar"><span>Before: 4.2 MB</span><span>After: 380 KB</span></div>
          <div className="stage">
            <div className="pic" />
            <div className="pic before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
            <span className="lab a">Before</span>
            <span className="lab b">After</span>
            <div className="line" style={{ left: pos + '%' }} />
            <input type="range" min="0" max="100" value={pos}
              onChange={(e) => setPos(+e.target.value)} aria-label="Before and after comparison" />
          </div>
        </div>
      </div>
    </section>
  );
}
