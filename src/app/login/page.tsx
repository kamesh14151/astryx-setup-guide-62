'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {VStack} from '@astryxdesign/core/Layout';
import {Center} from '@astryxdesign/core/Center';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';

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
    <Center axis="both" padding={6}>
      <Card padding={8} width="100%" maxWidth={400}>
        <VStack gap={4} hAlign="stretch">
          <VStack gap={1} hAlign="center">
            <Text type="display-1" as="h2">
              Welcome back
            </Text>
            <Text type="body" color="secondary" size="sm">
              Sign in to upload or delete gallery images
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

          <Button
            label="Sign in"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            isDisabled={!canSubmit}
            onClick={handleSignIn}
          />
        </VStack>
      </Card>
    </Center>
  );
}
