import Link from 'next/link';
import ToolsList from './ToolsList';

export default function Footer() {
  return (
    <>
<footer className="ft">
<div className="wrap">
<div className="ftg">
<div>
<Link href="/" className="logo" aria-label="Imgexa home"><svg className="lg" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="20" fill="#5B16EA"/><rect x="39" y="38" width="22" height="42" rx="11" fill="#fff"/><circle cx="43" cy="21" r="9" fill="#5EE3EE"/><circle cx="66" cy="14" r="5.5" fill="#5EC8F2"/><circle cx="78" cy="29" r="3.5" fill="#5EA8F5"/><circle cx="32" cy="34" r="2.2" fill="#5EA8F5"/></svg><span className="wm">img<em>exa</em></span></Link>
<p>Free online image tools to compress, resize, convert and edit images in seconds. Built for creators, businesses and everyone who works with images.</p>
<div className="fs">
<a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook"><svg className="i"><use href="#fb"/></svg></a>
<a href="https://www.instagram.com/imgexa_offical" target="_blank" rel="noopener" aria-label="Instagram"><svg className="i"><use href="#insta"/></svg></a>
<a href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg className="i"><use href="#in"/></svg></a>
</div>
</div>
<div><h4>Company</h4><ul>
<li><Link href="/about">About Us</Link></li><li><Link href="/contact">Contact Us</Link></li><li><Link href="/home">Home</Link></li><li><Link href="/privacy-policy">Privacy Policy</Link></li><li><Link href="/terms">Terms Conditions</Link></li></ul></div>
<div><h4>Tools</h4><ToolsList /></div>
<div><h4>Contact Info</h4>
<div className="ci"><i><svg className="i"><use href="#mail"/></svg></i><span><a href="mailto:imgexa8@gmail.com">imgexa8@gmail.com</a></span></div>
<div className="ci"><i><svg className="i"><use href="#insta"/></svg></i><span>Instagram: imgexa_offical<br />Facebook: Imgexa Offical<br />LinkedIn: Imgexa_offical</span></div>
<div className="sub"><i><svg className="i"><use href="#mail"/></svg></i><input type="email" placeholder="Enter your email" aria-label="Email" /></div>
</div>
</div>
<div className="fcopy">&copy; 2026 Imgexa. All rights reserved.</div>
</div>
</footer>
<a href="#" className="top" aria-label="Back to top"><svg className="i"><use href="#up"/></svg></a>
    </>
  );
}
