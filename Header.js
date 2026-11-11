'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
<header>
<div className="hbg"><svg viewBox="0 0 1440 104" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60C180 10 340 100 560 58S980 8 1180 52 1380 70 1440 40V104H0Z" fill="#fff" fillOpacity=".65"/><path d="M0 84C220 40 420 110 700 76S1120 40 1440 82V104H0Z" fill="#fff" fillOpacity=".8"/><path d="M0 60C180 10 340 100 560 58S980 8 1180 52 1380 70 1440 40" fill="none" stroke="#4F46E5" strokeOpacity=".08" strokeWidth="1.5"/><path d="M0 84C220 40 420 110 700 76S1120 40 1440 82" fill="none" stroke="#22D3EE" strokeOpacity=".18" strokeWidth="1.5"/></svg></div>
<div className="wrap hd">
<Link href="/" className="logo" aria-label="Imgexa home"><svg className="lg" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="20" fill="#5B16EA"/><rect x="39" y="38" width="22" height="42" rx="11" fill="#fff"/><circle cx="43" cy="21" r="9" fill="#5EE3EE"/><circle cx="66" cy="14" r="5.5" fill="#5EC8F2"/><circle cx="78" cy="29" r="3.5" fill="#5EA8F5"/><circle cx="32" cy="34" r="2.2" fill="#5EA8F5"/></svg><span className="wm">img<em>exa</em></span></Link>
<ul className={"mn"+(open?" open":"")} id="menu">
<li className="dd"><Link href="/home" className="on">Home <svg className="i c"><use href="#chev"/></svg></Link>
<div className="menu"><Link href="/">Landing Page</Link><Link href="/home">All Tools</Link></div></li>
<li><Link href="/about">About</Link></li>
<li className="dd"><Link href="/image-tools">Image Tools <svg className="i c"><use href="#chev"/></svg></Link>
<div className="menu">
<Link href="/png-to-jpg"><svg className="i"><use href="#conv"/></svg>PNG to JPG</Link>
<Link href="/jpg-to-png"><svg className="i"><use href="#conv"/></svg>JPG to PNG</Link>
<Link href="/webp-converter"><svg className="i"><use href="#web"/></svg>Convert to WebP</Link>
<Link href="/image-compressor"><svg className="i"><use href="#zip"/></svg>Image Compressor</Link>
<Link href="/image-resizer"><svg className="i"><use href="#resize"/></svg>Image Resizer</Link>
<Link href="/background-remover"><svg className="i"><use href="#bg"/></svg>Background Remover</Link>
</div></li>
<li><Link href="/contact">Contact</Link></li>
</ul>
<div className="hr">
<button className="srch" aria-label="Search"><svg className="i"><use href="#search"/></svg></button>
<Link className="quote" href="/png-to-jpg">Start Free</Link>
<button className="burger" onClick={()=>setOpen(!open)} aria-label="Menu"><svg className="i" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
</div>
</div>
</header>
  );
}
