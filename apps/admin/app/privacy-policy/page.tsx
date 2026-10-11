import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy – Belzo Hyperlocal',
  description:
    'Belzo Privacy Policy: how we collect, use, and protect your personal data for fast hyperlocal delivery.',
};

export default function PrivacyPolicyPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoPill}>BELZO</div>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.subtitle}>
            Effective Date: <strong>1 October 2026</strong> &nbsp;·&nbsp; Joniha
            Central Hub, Bindki, Fatehpur – 212635, Uttar Pradesh, India
          </p>
        </div>

        <div style={styles.card}>
          <Section title="1. Information We Collect">
            <p>We collect the following categories of personal data:</p>
            <ul>
              <li>
                <strong>Identity &amp; Contact:</strong> Full name, phone number,
                and email address provided during account registration.
              </li>
              <li>
                <strong>Delivery Address:</strong> Physical address (ward, street,
                landmark) saved for delivery purposes.
              </li>
              <li>
                <strong>Location Data (Foreground Only):</strong> Approximate and
                precise device location, collected{' '}
                <em>only while the app is open</em>, to find your nearest Belzo
                dark store and autofill your doorstep address.
              </li>
              <li>
                <strong>Order &amp; Purchase History:</strong> Items ordered, order
                amounts, timestamps, and delivery status for invoicing and support.
              </li>
              <li>
                <strong>Device Identifiers:</strong> Push notification tokens for
                order status alerts.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Data">
            <ul>
              <li>Find the nearest Belzo dark store within the 5 km service radius.</li>
              <li>Assign a courier and deliver your order to your doorstep.</li>
              <li>Send real-time order status push notifications.</li>
              <li>Generate order invoices and support your customer care queries.</li>
              <li>Detect and prevent fraudulent orders.</li>
            </ul>
          </Section>

          <Section title="3. Location Data – Prominent Disclosure">
            <div style={styles.disclosureBox}>
              <strong>📍 Location Usage Disclosure:</strong>
              <br />
              Belzo collects location data to find nearby dark stores and autofill
              your doorstep delivery address. Location is accessed{' '}
              <strong>only in the foreground</strong> (while the app is actively
              in use). We do not collect background location data. Your location
              is never sold to advertisers or third parties.
            </div>
          </Section>

          <Section title="4. Data Sharing">
            <p>
              We share your data only with entities required to fulfil your order:
            </p>
            <ul>
              <li>
                <strong>Supabase (Database &amp; Auth):</strong> Encrypted
                storage of all personal and order data.
              </li>
              <li>
                <strong>Courier Partner (Rider):</strong> Your name, phone, and
                delivery address are shared with the assigned rider solely for
                order delivery.
              </li>
              <li>
                <strong>Payment Gateway:</strong> Transaction amounts processed
                via RBI-compliant UPI gateways. We never store card numbers or
                UPI PINs.
              </li>
            </ul>
            <p>
              We <strong>do not sell</strong> your personal data to any third
              party.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              Order and profile data is retained for <strong>2 years</strong> for
              legal and tax compliance under Indian GST law. You may request early
              deletion (see Section 7).
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              All data is encrypted in transit over <strong>HTTPS / TLS 1.3</strong>.
              Database rows are protected with row-level security (RLS) policies
              enforced by Supabase. Delivery PINs are generated on-device and never
              stored in plaintext.
            </p>
          </Section>

          <Section title="7. Your Rights &amp; Account Deletion">
            <p>You have the right to:</p>
            <ul>
              <li>Access a copy of your personal data.</li>
              <li>Correct inaccurate information.</li>
              <li>
                <strong>Delete your account and all associated data</strong> via our
                in-app deletion flow or at:{' '}
                <a
                  href="/delete-account"
                  style={{ color: '#FF5E00', fontWeight: 600 }}
                >
                  belzo.app/delete-account
                </a>
              </li>
            </ul>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              Belzo is intended for users <strong>18 years and above</strong>. We
              do not knowingly collect data from minors. If you believe a minor
              has registered, contact us immediately.
            </p>
          </Section>

          <Section title="9. Contact Us">
            <p>
              Data Controller: <strong>Belzo Hyperlocal Pvt Ltd</strong>
              <br />
              Address: Joniha Chauraha, Bindki Road, Fatehpur – 212635, UP, India
              <br />
              Email:{' '}
              <a href="mailto:privacy@belzo.app" style={{ color: '#FF5E00' }}>
                privacy@belzo.app
              </a>
            </p>
          </Section>

          <div style={styles.footer}>
            <p style={{ color: '#8E8E93', fontSize: 12, textAlign: 'center' }}>
              © 2026 Belzo Hyperlocal. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.sectionBody}>{children}</div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
    padding: '40px 16px 80px',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  container: {
    maxWidth: 720,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logoPill: {
    display: 'inline-block',
    backgroundColor: '#FF5E00',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 2,
    padding: '5px 14px',
    borderRadius: 999,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    color: '#111827',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    margin: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    border: '0.5px solid rgba(0,0,0,0.08)',
    padding: '32px 36px',
    boxShadow: '0 2px 24px rgba(0,0,0,0.04)',
  },
  section: {
    marginBottom: 32,
    paddingBottom: 32,
    borderBottom: '0.5px solid rgba(0,0,0,0.07)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 12,
    marginTop: 0,
  },
  sectionBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: '1.8',
  },
  disclosureBox: {
    backgroundColor: '#FFF7ED',
    border: '1px solid #FFEDD5',
    borderRadius: 14,
    padding: '16px 20px',
    fontSize: 14,
    color: '#92400E',
    lineHeight: '1.7',
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
  },
};
