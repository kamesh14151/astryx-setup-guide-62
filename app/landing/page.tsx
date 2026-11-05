'use client';

import type {CSSProperties} from 'react';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {VStack, HStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Grid} from '@astryxdesign/core/Grid';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Link} from '@astryxdesign/core/Link';
import {ArrowRightIcon} from '@heroicons/react/20/solid';
import {ThemeToggle} from '@/components/theme-toggle';

const TOOLS = [
  {
    src: '/images.jpeg',
    alt: 'Kanban board tool screenshot',
    href: '/kanban',
    label: 'Kanban Board',
    tooltip: 'Go to Kanban Board — manage your tasks visually',
  },
  {
    src: '/https-astryx-setup-guide.vercel.app-upload.png',
    alt: 'File upload and media management tool screenshot',
    href: '/upload',
    label: 'Upload',
    tooltip: 'Go to Upload — manage and upload your files',
  },
  {
    src: '/template-assets/light-working-vertical-2.png',
    alt: 'Colorful lifestyle scene with warm tones',
    href: '/gpa',
    label: 'GPA Calculator',
    tooltip: 'Go to GPA Calculator — track your academic grades',
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
};
// Rounds the image corners. No radius prop on AspectRatio (#2582).
const galleryImageClip: CSSProperties = {
  borderRadius: 'var(--radius-container)',
  overflow: 'hidden',
};

// Card label above each image — bigger, bolder
const cardTitle: CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: 'var(--color-text-primary)',
};

// Tooltip wrapper for the link
const tooltipWrapper: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
};

const tooltipBubble: CSSProperties = {
  position: 'absolute',
  bottom: 'calc(100% + 8px)',
  left: '50%',
  transform: 'translateX(-50%)',
  whiteSpace: 'nowrap',
  backgroundColor: '#262626',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.20)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
  fontSize: '0.75rem',
  fontWeight: 500,
  padding: '0.35rem 0.65rem',
  borderRadius: '8px',
  pointerEvents: 'none',
  opacity: 0,
  transition: 'opacity 0.15s ease, transform 0.15s ease',
  zIndex: 50,
};

type Tool = (typeof TOOLS)[number];

function TooltipLink({tool}: {tool: Tool}) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      style={tooltipWrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}>
      <span style={{...tooltipBubble, opacity: visible ? 1 : 0}}>
        {tool.tooltip}
      </span>
      <Link href={tool.href} isStandalone>
        <span className="text-foreground font-medium hover:underline">
          {tool.label}
        </span>
      </Link>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [learnMoreTooltip, setLearnMoreTooltip] = useState(false);

  return (
    <>
      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>
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
                  <span className="text-foreground">Little joys, everywhere you go</span>
                </Heading>
                <Text
                  type="body"
                  color="secondary"
                  justify="center"
                  textWrap="balance">
                  <span className="text-muted-foreground">
                    Sometimes all it takes is one small thing to turn your whole day around.
                  </span>
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
                {/* Learn more → /contact with tooltip */}
                <div
                  style={{position: 'relative', display: 'inline-flex'}}
                  onMouseEnter={() => setLearnMoreTooltip(true)}
                  onMouseLeave={() => setLearnMoreTooltip(false)}>
                  <span
                    style={{
                      ...tooltipBubble,
                      opacity: learnMoreTooltip ? 1 : 0,
                    }}>
                    Visit our contact page
                  </span>
                  <Button
                    label="Learn more"
                    variant="secondary"
                    onPress={() => router.push('/contact')}
                  />
                </div>
              </HStack>
            </VStack>

            {/* Tool cards — compact landscape, label above, tooltip link below */}
            <Grid columns={{minWidth: 240, repeat: 'fit'}} gap={6}>
              {TOOLS.map(tool => (
                <VStack key={tool.href} gap={2}>
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    {tool.label}
                  </span>

                  {/* Plain image — no modal, no link */}
                  <AspectRatio ratio={16 / 9} style={galleryImageClip}>
                    <img style={galleryImage} src={tool.src} alt={tool.alt} />
                  </AspectRatio>

                  <TooltipLink tool={tool} />
                </VStack>
              ))}
            </Grid>
          </VStack>
        </LayoutContent>
      }
    />
  </>
);
}
