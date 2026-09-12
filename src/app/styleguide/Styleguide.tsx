'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Modal,
  NavItem,
  NavSection,
  Skeleton,
  Spinner,
  Text,
  ToastProvider,
  useToast,
} from '@/components/ui';
import {
  SendIcon,
  ReceiveIcon,
  RequestIcon,
  HomeIcon,
  WalletIcon,
  SettingsIcon,
  ContactsIcon,
} from '@/components/ui/icons';
import { color } from '@/lib/design/tokens';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      <Text variant="metadata">{title}</Text>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>;
}

function Interactive() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [page, setPage] = useState('overview');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px', display: 'grid', gap: '44px' }}>
      <header style={{ display: 'grid', gap: '8px' }}>
        <Text variant="metadata" tone="primary">
          PrivyPay · Design system
        </Text>
        <Text variant="section" as="h1">
          Component reference
        </Text>
        <Text variant="body">Stage 1 — the reusable library hand-built screens compose from.</Text>
      </header>

      <Section title="Typography">
        <Card>
          <div style={{ display: 'grid', gap: '10px' }}>
            <Text variant="hero">Your payment agent</Text>
            <Text variant="section">Section heading</Text>
            <Text variant="card">Card heading</Text>
            <Text variant="body">Body copy — send, request and manage stablecoin payments by username.</Text>
            <Text variant="caption">Caption — supporting detail.</Text>
            <Text variant="metadata">METADATA · BUILT ON CELO</Text>
          </div>
        </Card>
      </Section>

      <Section title="Buttons">
        <Row>
          <Button variant="primary" icon={SendIcon}>
            Send money
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </Row>
      </Section>

      <Section title="Inputs">
        <div style={{ display: 'grid', gap: '14px', maxWidth: 420 }}>
          <Field label="Recipient" placeholder="@username" hint="People you pay by username." />
          <Field label="Amount" placeholder="0.00" error="Enter an amount greater than zero." />
        </div>
      </Section>

      <Section title="Badges">
        <Row>
          <Badge tone="success" dot>
            Completed
          </Badge>
          <Badge tone="warning" dot>
            Pending
          </Badge>
          <Badge tone="primary">Celo</Badge>
          <Badge tone="danger" dot>
            Failed
          </Badge>
          <Badge>Neutral</Badge>
        </Row>
      </Section>

      <Section title="Navigation">
        <Card padding="12px" style={{ maxWidth: 240 }}>
          <NavSection>
            <NavItem label="Overview" icon={HomeIcon} active={page === 'overview'} onSelect={() => setPage('overview')} />
            <NavItem label="Contacts" icon={ContactsIcon} active={page === 'contacts'} onSelect={() => setPage('contacts')} />
          </NavSection>
          <NavSection label="WALLET">
            <NavItem label="Wallet" icon={WalletIcon} active={page === 'wallet'} onSelect={() => setPage('wallet')} />
            <NavItem label="Settings" icon={SettingsIcon} active={page === 'settings'} onSelect={() => setPage('settings')} />
          </NavSection>
        </Card>
      </Section>

      <Section title="Loading & empty states">
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
          <Card>
            <div style={{ display: 'grid', gap: '10px' }}>
              <Skeleton width="40%" height={12} />
              <Skeleton height={28} />
              <Skeleton width="70%" />
              <Row>
                <Spinner />
                <Text variant="caption">Loading…</Text>
              </Row>
            </div>
          </Card>
          <EmptyState
            icon={RequestIcon}
            title="No requests yet"
            description="Money you ask for shows up here."
            action={
              <Button size="sm" variant="secondary">
                New request
              </Button>
            }
          />
        </div>
      </Section>

      <Section title="Overlays & toasts">
        <Row>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open dialog
          </Button>
          <Button variant="secondary" icon={ReceiveIcon} onClick={() => setSheetOpen(true)}>
            Open sheet
          </Button>
          <Button variant="secondary" onClick={() => toast.show('Payment sent to @sarah', { tone: 'success' })}>
            Success toast
          </Button>
          <Button variant="secondary" onClick={() => toast.show('Couldn’t complete payment', { tone: 'danger' })}>
            Error toast
          </Button>
        </Row>
      </Section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirm payment">
        <Text variant="body">This is an accessible dialog — focus is trapped, Esc closes it, focus returns on close.</Text>
        <div style={{ display: 'flex', gap: '9px', marginTop: '18px' }}>
          <Button block onClick={() => setModalOpen(false)}>
            Confirm
          </Button>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} placement="bottom" title="Receive">
        <Text variant="body" tone="muted">
          Bottom-sheet placement — the send / receive / detail pattern.
        </Text>
        <div style={{ marginTop: 16, padding: 24, borderRadius: 12, background: color.background, textAlign: 'center' }}>
          <Text variant="metadata">@chris · Celo</Text>
        </div>
        <Button block style={{ marginTop: 16 }} onClick={() => setSheetOpen(false)}>
          Done
        </Button>
      </Modal>
    </div>
  );
}

export function Styleguide() {
  return (
    <ToastProvider>
      <Interactive />
    </ToastProvider>
  );
}
