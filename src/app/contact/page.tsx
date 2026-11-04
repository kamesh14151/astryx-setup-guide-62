'use client';

import {useState, type CSSProperties} from 'react';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Center} from '@astryxdesign/core/Center';
import {Section} from '@astryxdesign/core/Section';
import {Grid} from '@astryxdesign/core/Grid';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Link} from '@astryxdesign/core/Link';
import {Divider} from '@astryxdesign/core/Divider';
import {Card} from '@astryxdesign/core/Card';
import {Selector} from '@astryxdesign/core/Selector';

// ─── Brand settings: edit these ─────────────────────────────────────────────

const BRAND = 'AJ STUDIOZ';

// Where the form sends its message. REPLACE with your real address.
const CONTACT_EMAIL = 'hello@your-domain.com';

// Optional cover photo. Put a file in /public/template-assets/ (or paste a
// Blob URL). If the file is missing, a plain block is shown instead.
const ILLUSTRATION_URL = '/template-assets/contact-cover.jpg';

const CONTACT_COLUMNS = [
  {label: 'General inquiries', email: 'hello@your-domain.com'},
  {label: 'New projects', email: 'projects@your-domain.com'},
  {label: 'Press & partnerships', email: 'press@your-domain.com'},
];

const INQUIRY_REASONS = [
  'New project',
  'General inquiry',
  'Press & media',
  'Partnerships',
  'Product feedback',
  'Technical support',
  'Other',
];

const BUDGET_OPTIONS = [
  'Under $10k',
  '$10k – $50k',
  '$50k – $100k',
  '$100k – $500k',
  '$500k+',
  'Not sure yet',
];

// ─── Styles ─────────────────────────────────────────────────────────────────

const pageStyle: CSSProperties = {minHeight: '100%'};
const illustrationImg: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'var(--radius-container)',
  overflow: 'hidden',
};
const illustrationFallback: CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: 'var(--radius-container)',
  background: 'linear-gradient(135deg, #262626, #0a0a0a)',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryReason, setInquiryReason] = useState('');
  const [budget, setBudget] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const errors = submitted
    ? {
        fullName: !fullName.trim() ? 'Required' : undefined,
        email: !email.trim()
          ? 'Required'
          : !EMAIL_PATTERN.test(email.trim())
            ? 'Enter a valid email'
            : undefined,
        details: !details.trim() ? 'Required' : undefined,
      }
    : {};

  const handleSubmit = () => {
    setSubmitted(true);
    if (
      !fullName.trim() ||
      !EMAIL_PATTERN.test(email.trim()) ||
      !details.trim()
    ) {
      return;
    }

    // Opens the visitor's email app with the message filled in.
    const subject = `${inquiryReason || 'New inquiry'} from ${fullName.trim()}`;
    const lines = [
      `Name: ${fullName.trim()}`,
      `Email: ${email.trim()}`,
    ];
    if (company.trim()) lines.push(`Company: ${company.trim()}`);
    if (jobTitle.trim()) lines.push(`Job title: ${jobTitle.trim()}`);
    if (phone.trim()) lines.push(`Phone: ${phone.trim()}`);
    if (inquiryReason) lines.push(`Reason: ${inquiryReason}`);
    if (budget) lines.push(`Budget: ${budget}`);
    lines.push('', details.trim());
    const body = lines.join('\n');

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <Center style={pageStyle}>
      <Section maxWidth={1100} width="100%" padding={10} variant="transparent">
        <VStack gap={10}>
          <Grid columns={{minWidth: 320}} align="center" gap={10}>
            <VStack gap={6}>
              <VStack gap={3}>
                <Text type="label" color="secondary">
                  {BRAND}
                </Text>
                <Text type="display-1" as="h1">
                  Let&apos;s work together
                </Text>
                <Text type="body" color="secondary">
                  Tell us what you&apos;re working on and {BRAND} will help you
                  figure out the best path forward.
                </Text>
              </VStack>
              <AspectRatio ratio={4 / 3}>
                {imageFailed ? (
                  <div style={illustrationFallback} aria-hidden="true" />
                ) : (
                  <img
                    src={ILLUSTRATION_URL}
                    alt={`${BRAND} studio`}
                    style={illustrationImg}
                    onError={() => setImageFailed(true)}
                    ref={el => {
                      // Catches images that failed before the page hydrated.
                      if (el && el.complete && el.naturalWidth === 0) {
                        setImageFailed(true);
                      }
                    }}
                  />
                )}
              </AspectRatio>
            </VStack>

            <Card padding={8}>
              <VStack gap={4}>
                <Text type="label">Your details</Text>
                <TextInput
                  label="Full name"
                  isLabelHidden
                  placeholder="Full name*"
                  value={fullName}
                  onChange={setFullName}
                  status={
                    errors.fullName
                      ? {type: 'error', message: errors.fullName}
                      : undefined
                  }
                />
                <Grid columns={{minWidth: 180}} gap={3}>
                  <TextInput
                    label="Email"
                    isLabelHidden
                    type="email"
                    placeholder="Email*"
                    value={email}
                    onChange={setEmail}
                    status={
                      errors.email
                        ? {type: 'error', message: errors.email}
                        : undefined
                    }
                  />
                  <TextInput
                    label="Company name"
                    isLabelHidden
                    placeholder="Company name"
                    value={company}
                    onChange={setCompany}
                  />
                </Grid>
                <Grid columns={{minWidth: 180}} gap={3}>
                  <TextInput
                    label="Job title"
                    isLabelHidden
                    placeholder="Job title"
                    value={jobTitle}
                    onChange={setJobTitle}
                  />
                  <TextInput
                    label="Phone number"
                    isLabelHidden
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={setPhone}
                  />
                </Grid>

                <VStack gap={2}>
                  <Text type="label">What are you reaching out about?</Text>
                  <HStack gap={2} wrap="wrap">
                    {INQUIRY_REASONS.map(reason => (
                      <Token
                        key={reason}
                        label={reason}
                        color={inquiryReason === reason ? 'blue' : 'default'}
                        onClick={() =>
                          setInquiryReason(prev =>
                            prev === reason ? '' : reason,
                          )
                        }
                      />
                    ))}
                  </HStack>
                </VStack>
                <Selector
                  label="Budget range"
                  options={BUDGET_OPTIONS}
                  value={budget}
                  onChange={setBudget}
                  placeholder="Select a budget range..."
                />
                <TextArea
                  label="Project details"
                  isLabelHidden
                  placeholder="Project details*"
                  value={details}
                  onChange={setDetails}
                  status={
                    errors.details
                      ? {type: 'error', message: errors.details}
                      : undefined
                  }
                />
                <VStack hAlign="stretch" gap={2}>
                  <Button
                    label="Let's connect"
                    variant="primary"
                    onClick={handleSubmit}
                  />
                  {sent && (
                    <Text type="supporting" color="secondary">
                      Your email app should open with the message ready to send
                      to {BRAND}. If it didn&apos;t, write to{' '}
                      <Link href={`mailto:${CONTACT_EMAIL}`} type="supporting">
                        {CONTACT_EMAIL}
                      </Link>
                      .
                    </Text>
                  )}
                </VStack>
              </VStack>
            </Card>
          </Grid>

          <VStack gap={6}>
            <Divider />
            <Grid columns={{minWidth: 200}} gap={6}>
              {CONTACT_COLUMNS.map(col => (
                <VStack key={col.label} gap={1} hAlign="center">
                  <Text type="supporting" color="secondary">
                    {col.label}
                  </Text>
                  <Link href={`mailto:${col.email}`} type="body" size="sm">
                    {col.email}
                  </Link>
                </VStack>
              ))}
            </Grid>
            <VStack hAlign="center">
              <Text type="supporting" color="secondary">
                © {new Date().getFullYear()} {BRAND}
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </Section>
    </Center>
  );
}
