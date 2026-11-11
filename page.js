import ToolHero from '../../components/ToolHero';
import ToolInfo from '../../components/ToolInfo';
import WebpConverter from '../../components/WebpConverter';

export const metadata = {
  title: "Convert Image to WebP Online Free – JPG & PNG to WebP",
  description:
    "Convert JPG and PNG images to WebP online for free. Create lightweight WebP images to improve website performance and reduce image file sizes.",
  keywords: ["convert JPG to WebP online free", "convert PNG to WebP without losing quality", "image to WebP converter online", "free WebP image converter", "convert multiple images to WebP", "reduce image size using WebP format", "convert JPEG to WebP online", "PNG to WebP converter free", "optimize images for website using WebP", "change image format to WebP online"],
};

export default function Page() {
  return (
    <>
      <ToolHero tag="Free WebP Converter" title="Convert Images to WebP Online"
        text="Convert images to WebP online for faster websites and better SEO scores." />
      <section className="pj-wrap"><div className="wrap"><WebpConverter /></div></section>
      <ToolInfo
        keywords={metadata.keywords} intro={metadata.description}
        stepsTitle="Convert to WebP in 3 Easy Steps"
        steps={[
          ['img', '1. Add your images', 'Drop JPG or PNG files. You can convert many at once.'],
          ['resize', '2. Set the quality', 'Choose the WebP quality and an optional maximum size.'],
          ['zip', '3. Download WebP files', 'Save each image or get everything as one ZIP file.'],
        ]}
        whyTitle="Why Use WebP?"
        whyText="WebP files are usually much smaller than JPG and PNG, so pages load faster and score better on speed and SEO."
        features={[
          ['bolt', 'Faster websites', 'Smaller images improve loading speed and Core Web Vitals.'],
          ['lock', 'Private', 'Conversion happens in your browser. Nothing is uploaded.'],
          ['layers', 'Bulk conversion', 'Convert up to 50 images with the same settings.'],
        ]}
        faqTitle="WebP Converter Questions"
        faqs={[
          ['What is WebP?', 'WebP is a modern image format from Google. It gives smaller files than JPG and PNG with the same visible quality, and it supports transparency.'],
          ['Is WebP good for SEO?', 'Yes. Smaller images load faster, and page speed is a ranking signal for search engines.'],
          ['Which browsers support WebP?', 'All modern browsers, including Chrome, Edge, Firefox and Safari.'],
          ['Is transparency kept?', 'Yes. Transparent PNG images stay transparent after converting to WebP.'],
        ]}
        related={[['/png-to-jpg', 'PNG to JPG'], ['/jpg-to-png', 'JPG to PNG'], ['/image-compressor', 'Image Compressor']]}
      />
    </>
  );
}
