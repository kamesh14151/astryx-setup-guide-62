'use client';

import {Layout, LayoutContent, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function GpaPage() {
  return (
    <Layout
      content={
        <LayoutContent padding={6}>
          <VStack gap={4} hAlign="center">
            <Heading level={1} type="display-2" justify="center">
              GPA Calculator
            </Heading>
            <Text type="body" color="secondary" justify="center">
              Coming soon — track your grades and calculate your GPA here.
            </Text>
          </VStack>
        </LayoutContent>
      }
    />
  );
}

