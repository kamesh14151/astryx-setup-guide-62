'use client';

import type {CSSProperties} from 'react';
import NextLink from 'next/link';
import {VStack, HStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Grid} from '@astryxdesign/core/Grid';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Link} from '@astryxdesign/core/Link';
import {ArrowRightIcon} from '@heroicons/react/20/solid';

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
const galleryImage: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};
// Rounds the image corners. No radius prop on AspectRatio (#2582).
const galleryImageClip: CSSProperties = {
  borderRadius: 'var(--radius-container)',
};

const toolCard: CSSProperties = {
  position: 'relative',
  display: 'block',
  textDecoration: 'none',
};

export default function LandingPage() {
  return (
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

            {/* Tool cards — label above, image, link below */}
            <Grid columns={{minWidth: 200, repeat: 'fit'}} gap={4}>
              {TOOLS.map(tool => (
                <VStack key={tool.href} gap={2}>
                  {/* Tool name above the image */}
                  <Text type="label" color="primary">
                    {tool.label}
                  </Text>

                  {/* Clickable image */}
                  <NextLink href={tool.href} style={toolCard}>
                    <AspectRatio ratio={4 / 5} style={galleryImageClip}>
                      <img style={galleryImage} src={tool.src} alt={tool.alt} />
                    </AspectRatio>
                  </NextLink>

                  {/* Standalone text link below the image */}
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
  );
}

