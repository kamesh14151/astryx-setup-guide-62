'use client';

import {useState, type CSSProperties} from 'react';
import {useRouter} from 'next/navigation';
import {VStack} from '@astryxdesign/core/Layout';
import {Center} from '@astryxdesign/core/Center';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Link} from '@astryxdesign/core/Link';
import {Divider} from '@astryxdesign/core/Divider';

// Background photo from the template. Put the file at
// /public/template-assets/building.png (or paste a Blob URL here).
// If the file is missing, the soft gradient behind it is shown instead.
const BG_URL = '/template-assets/building.png';

const pageStyle: CSSProperties = {
  minHeight: '100dvh',
  backgroundImage: `url(${BG_URL}), linear-gradient(135deg, #f4e9e2, #e8e8e8)`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  async function handleSignIn() {
    if (!canSubmit || isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Could not sign in. Try again.');
        setIsLoading(false);
        return;
      }
      router.push('/upload');
      router.refresh();
    } catch {
      setError('Network error. Try again.');
      setIsLoading(false);
    }
  }

  return (
    <Center axis="both" padding={6} style={pageStyle}>
      <Card padding={8} width="100%" maxWidth={400}>
        <VStack gap={4} hAlign="stretch">
          <VStack gap={1} hAlign="center">
            <Text type="display-1" as="h2">
              Welcome back
            </Text>
            <Text type="body" color="secondary" size="sm">
              Enter your details to sign in to your account
            </Text>
          </VStack>

          <VStack gap={2}>
            <TextInput
              label="Email"
              isLabelHidden
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(v: string) => {
                setEmail(v);
                setError('');
              }}
              onEnter={handleSignIn}
              size="lg"
            />
            <TextInput
              label="Password"
              isLabelHidden
              type="password"
              placeholder="Password"
              value={password}
              onChange={(v: string) => {
                setPassword(v);
                setError('');
              }}
              onEnter={handleSignIn}
              size="lg"
              status={error ? {type: 'error', message: error} : undefined}
            />
          </VStack>

          <Link href="/contact" size="sm" color="secondary" type="supporting">
            Having trouble signing in?
          </Link>

          <Button
            label="Sign in"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            isDisabled={!canSubmit}
            onClick={handleSignIn}
          />

          <Divider label="Or sign in with" />

          {/* SSO is not connected yet, so this stays disabled. */}
          <Button
            label="Continue with SSO"
            variant="secondary"
            size="lg"
            isDisabled
          />

          <VStack hAlign="center">
            <Text type="supporting" color="secondary">
              Don&apos;t have an account?{' '}
              <Link href="/contact" type="supporting">
                Request access
              </Link>
            </Text>
          </VStack>
        </VStack>
      </Card>
    </Center>
  );
}
