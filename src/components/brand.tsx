import {HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export const BRAND = 'AJ STUDIOZ';

// AJ logo (/public/aj-logo.svg) followed by the brand name.
export function BrandMark({size = 28}: {size?: number}) {
  return (
    <HStack gap={2} vAlign="center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/aj-logo.svg"
        alt=""
        width={size}
        height={size}
        style={{display: 'block', flexShrink: 0}}
      />
      <Text type="label" color="secondary">
        {BRAND}
      </Text>
    </HStack>
  );
}
