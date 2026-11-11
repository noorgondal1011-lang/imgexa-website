import './globals.css';
import Sprite from '../components/Sprite';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: "Free Online Image Tools – Convert, Compress, Resize & Edit Images",
  description:
    "Access free online image tools to convert, compress, resize, and optimize images. Remove backgrounds and transform PNG, JPG, and WebP images quickly and easily.",
  keywords: ["free online image tools", "best free image editing tools online", "convert compress and resize images online", "free image converter without software", "online photo editing tools free", "all in one image tools online", "free image tools for website and social media", "edit images online without downloading software", "online image optimization tools", "free image processing tools for beginners"],
  robots: 'index, follow',
  openGraph: {
    title: "Free Online Image Tools – Convert, Compress, Resize & Edit Images",
    description: "Access free online image tools to convert, compress, resize, and optimize images. Remove backgrounds and transform PNG, JPG, and WebP images quickly and easily.",
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Sprite />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
