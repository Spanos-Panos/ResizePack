import { Fragment, useEffect } from 'react';
import { LegalLayout } from './legal/LegalLayout';

// Single source of truth for the visible Q&A and the FAQPage JSON-LD, so they
// can never drift apart. Light Etsy/Shopify-seller emphasis in the copy.
const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is ResizePack free?',
    a: 'Yes. The free tier lets you resize and compress up to 5 images at once with the Etsy and Web presets — no account needed. Pro raises the limits and unlocks more presets and WebP export.',
  },
  {
    q: 'Are my images private?',
    a: 'Yes. Your images are processed entirely in your browser and are never uploaded to our servers. They never leave your device.',
  },
  {
    q: 'Can I prepare Etsy or Shopify listing photos?',
    a: 'Yes — that is exactly what ResizePack is built for. Pick the Etsy, Shopify, Amazon, Instagram, or Web preset to size your photos correctly, or set custom dimensions, then download them all as one ZIP.',
  },
  {
    q: 'How many images can I process at once?',
    a: 'The free tier handles up to 5 images per batch (10 MB each). Pro handles up to 500 images per batch (50 MB each), all delivered as a single ZIP download.',
  },
  {
    q: 'What image formats are supported?',
    a: 'You can upload JPEG, PNG, and WebP. Export to JPEG on the free tier, or to WebP on Pro for smaller files at the same quality.',
  },
  {
    q: 'Will resizing reduce my image quality?',
    a: 'You stay in control of the compression. The presets balance quality against file size, and you can adjust the settings to get exactly the trade-off you want.',
  },
  {
    q: 'Do I need an account?',
    a: 'No account is needed to use the free tool. You only create an account if you upgrade to Pro.',
  },
  {
    q: 'What does Pro include?',
    a: 'Pro raises the per-batch limits (up to 500 images, 50 MB each), adds WebP export, and unlocks every preset (Etsy, Shopify, Amazon, Instagram, Web, and Custom). It also adds seller power tools: crop every photo to a fixed aspect ratio (1:1, 4:5, 16:9, and more), cap each file to a target size in KB, and rename your outputs to clean sequential names like listing-001.jpg.',
  },
  {
    q: 'How do I cancel or get a refund?',
    a: 'You can cancel any time from Account → Manage billing; you keep Pro access until the end of the period you have already paid for. See the Refund & Cancellation Policy for details.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes — ResizePack runs in any modern browser on phone or desktop. Bulk batches are usually easiest to manage on a desktop where your files live.',
  },
];

export function FAQPage() {
  // Inject FAQPage structured data on mount (SPA has no SSR, so this relies on
  // Google's JS rendering). Removed on unmount so it doesn't bleed to other
  // routes. The homepage SoftwareApplication schema stays in index.html.
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <LegalLayout title="Frequently Asked Questions">
      {FAQS.map((item) => (
        <Fragment key={item.q}>
          <h2>{item.q}</h2>
          <p>{item.a}</p>
        </Fragment>
      ))}
    </LegalLayout>
  );
}
