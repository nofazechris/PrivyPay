import { notFound } from 'next/navigation';
import { Styleguide } from './Styleguide';

/**
 * Living reference for the design system (Stage 1). Development-only — it 404s in production
 * so it never ships as a public surface, while giving the team a place to see every primitive.
 */
export const metadata = { title: 'PrivyPay — Design system', robots: { index: false } };

export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Styleguide />;
}
