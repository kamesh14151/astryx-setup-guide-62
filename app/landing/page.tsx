'use client';

import type {CSSProperties} from 'react';
import {useState} from 'react';
import {VStack, HStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Grid} from '@astryxdesign/core/Grid';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Link} from '@astryxdesign/core/Link';
import {ArrowRightIcon, XMarkIcon, ArrowDownTrayIcon} from '@heroicons/react/20/solid';

const TOOLS = [
  {
    src: '/template-assets/colorful-home-horizontal-1.png',
    alt: 'Colorful home interior with vibrant decor',
    href: '/kanban',
    label: 'Kanban Board',
  },
  {
    src: '/template-assets/colorful-lifestyle-horizontal-1.png',
    alt: 'Colorful lifestyle portrait with natural lighting',
    href: '/upload',
    label: 'Upload',
  },
  {
    src: '/template-assets/colorful-lifestyle-horizontal-2.png',
    alt: 'Colorful lifestyle scene with warm tones',
    href: '/gpa',
    label: 'GPA Calculator',
  },
];

// NOTE: The only custom styling here is image fill + corner radius. It exists
// because Astryx has no image primitive — AspectRatio exposes no objectFit or
// radius props and there's no Image. Tracked in issue #2582; replace these
// with component props once it lands.
// Fills the AspectRatio box. No objectFit prop on AspectRatio (#2582).
// object-position: center top keeps faces visible in portrait crops.
const galleryImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center top',
  cursor: 'zoom-in',
};
// Rounds the image corners. No radius prop on AspectRatio (#2582).
const galleryImageClip: CSSProperties = {
  borderRadius: 'var(--radius-container)',
  overflow: 'hidden',
};

// Modal backdrop
const modalBackdrop: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  backgroundColor: 'rgba(0, 0, 0, 0.82)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
};

// Modal content box
const modalBox: CSSProperties = {
  position: 'relative',
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

// Full-size preview image inside modal
const modalImage: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '80vh',
  objectFit: 'contain',
  objectPosition: 'center top',
  borderRadius: 'var(--radius-container)',
  display: 'block',
};

// Top-right action bar inside modal
const modalActions: CSSProperties = {
  position: 'absolute',
  top: '-2.75rem',
  right: 0,
  display: 'flex',
  gap: '0.5rem',
};

const iconBtn: CSSProperties = {
  background: 'rgba(255,255,255,0.15)',
  border: 'none',
  borderRadius: '50%',
  width: '2.25rem',
  height: '2.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#fff',
  backdropFilter: 'blur(6px)',
};

type Tool = (typeof TOOLS)[number];

function ImageModal({tool, onClose}: {tool: Tool; onClose: () => void}) {
  const handleDownload = async () => {
    const res = await fetch(tool.src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tool.src.split('/').pop() ?? 'image';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    // Clicking the backdrop closes the modal
    <div style={modalBackdrop} onClick={onClose}>
      {/* Stop propagation so clicking the image/box doesn't close */}
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={modalActions}>
          <button style={iconBtn} onClick={handleDownload} title="Download">
            <ArrowDownTrayIcon width={16} height={16} />
          </button>
          <button style={iconBtn} onClick={onClose} title="Close">
            <XMarkIcon width={16} height={16} />
          </button>
        </div>
        <img style={modalImage} src={tool.src} alt={tool.alt} />
        <Text type="label" color="secondary" justify="center">
          {tool.alt}
        </Text>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [previewTool, setPreviewTool] = useState<Tool | null>(null);

  return (
    <>
      <Layout
        content={
          <LayoutContent padding={6}>
            <VStack gap={10}>
              {/* Hero heading + CTA */}
              <VStack gap={6} hAlign="center">
                <VStack gap={3} hAlign="center">
                  <Heading
                    level={1}
                    type="display-2"
                    justify="center"
                    textWrap="balance">
                    Little joys, everywhere you go
                  </Heading>
                  <Text
                    type="body"
                    color="secondary"
                    justify="center"
                    textWrap="balance">
                    Sometimes all it takes is one small thing to turn your whole
                    day around.
                  </Text>
                </VStack>
                <HStack gap={3}>
                  <Button
                    label="Get started"
                    variant="primary"
                    endContent={
                      <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                    }
                  />
                  <Button label="Learn more" variant="secondary" />
                </HStack>
              </VStack>

              {/* Tool cards — label above, image (click to preview), link below */}
              <Grid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
                {TOOLS.map(tool => (
                  <VStack key={tool.href} gap={2}>
                    {/* Tool name above the image */}
                    <Text type="label" color="primary">
                      {tool.label}
                    </Text>

                    {/* Click image to open preview modal */}
                    <AspectRatio ratio={4 / 5} style={galleryImageClip}>
                      <img
                        style={galleryImage}
                        src={tool.src}
                        alt={tool.alt}
                        onClick={() => setPreviewTool(tool)}
                      />
                    </AspectRatio>

                    {/* Standalone text link to the tool page */}
                    <Link href={tool.href} isStandalone>
                      {tool.label}
                    </Link>
                  </VStack>
                ))}
              </Grid>
            </VStack>
          </LayoutContent>
        }
      />

      {/* Image preview modal */}
      {previewTool && (
        <ImageModal tool={previewTool} onClose={() => setPreviewTool(null)} />
      )}
    </>
  );
}
