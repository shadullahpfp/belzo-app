import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delete Account & Data Request – Belzo Hyperlocal',
  description:
    'Request deletion of your Belzo account and associated personal data in accordance with Google Play Data Safety policy.',
};

export default function DeleteAccountPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoPill}>BELZO</div>
          <h1 style={styles.title}>Account & Data Deletion Request</h1>
          <p style={styles.subtitle}>
            Belzo Hyperlocal Quick-Commerce &nbsp;·&nbsp; Joniha Central Hub, Bindki, Fatehpur – 212635, Uttar Pradesh, India
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.noticeBox}>
            <p style={{ margin: 0, fontWeight: '600', color: '#92400E' }}>
              🔒 User Data Privacy & Google Play Data Safety Compliance
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#78350F', lineHeight: '1.5' }}>
              You have the right to request the deletion of your Belzo account and personal data at any time.
              You can initiate deletion either directly within the mobile app under <strong>Profile ➔ Delete Account</strong> or by submitting this request form.
            </p>
          </div>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>1. How to Request Deletion</h2>
            <div style={styles.methodBox}>
              <h3 style={styles.methodTitle}>Option A: Direct In-App Deletion (Instant)</h3>
              <ol style={styles.list}>
                <li>Open the <strong>Belzo</strong> mobile app on your Android or iOS device.</li>
                <li>Go to the <strong>Profile</strong> tab in the bottom navigation bar.</li>
                <li>Scroll down and tap <strong>Delete Account &amp; Data</strong>.</li>
                <li>Confirm the prompt. Your active session, profile, and addresses will be erased immediately.</li>
              </ol>
            </div>

            <div style={{ ...styles.methodBox, marginTop: '16px' }}>
              <h3 style={styles.methodTitle}>Option B: Web-Based Request (Processed within 48 Hours)</h3>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6' }}>
                If you have uninstalled the app or cannot access your account, send an email to our Data Protection Officer at:
              </p>
              <div style={styles.contactEmailBox}>
                <span style={{ fontWeight: '700', color: '#111827' }}>support@belzo.in</span>
                <span style={{ color: '#6B7280', fontSize: '13px' }}> (Subject: &quot;Account Deletion Request - [Your Phone/Email]&quot;)</span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>
                Please include the mobile number or Google account email associated with your Belzo account. We will process your deletion request and confirm via email within 48 hours.
              </p>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Data That Will Be Deleted</h2>
            <ul style={styles.list}>
              <li><strong>User Profile:</strong> Name, Google avatar, email address, phone number, and Clerk user identifier.</li>
              <li><strong>Saved Addresses:</strong> All home, work, and custom delivery coordinates and addresses.</li>
              <li><strong>Push Notification Tokens:</strong> Expo/FCM push device tokens.</li>
              <li><strong>Cart &amp; Draft Orders:</strong> Any active unfulfilled cart sessions.</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Data Retained &amp; Legal Retention Period</h2>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6' }}>
              In compliance with applicable Indian financial and taxation laws (including GST statutory records under the Goods and Services Tax Act and the Information Technology Act):
            </p>
            <ul style={styles.list}>
              <li>
                <strong>Completed Order Invoices &amp; Transaction Logs:</strong> Retained in encrypted, anonymized archives for up to 7 years solely for tax, legal auditing, and anti-fraud verification.
              </li>
              <li>
                Retained records are unlinked from active user credentials and are strictly inaccessible for marketing or user profiling.
              </li>
            </ul>
          </section>

          <div style={styles.footerNote}>
            Questions? Contact our Data Grievance Officer at{' '}
            <a href="mailto:support@belzo.in" style={{ color: '#FF5E00', textDecoration: 'none', fontWeight: '600' }}>
              support@belzo.in
            </a>{' '}
            or call our Joniha Helpline at +91 98765 43210.
          </div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#111827',
    padding: '48px 16px',
  },
  container: {
    maxWidth: '760px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  logoPill: {
    display: 'inline-block',
    backgroundColor: '#FF5E00',
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: '14px',
    letterSpacing: '3px',
    padding: '4px 14px',
    borderRadius: '100px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
    lineHeight: '1.5',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '36px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    border: '1px solid #E5E7EB',
  },
  noticeBox: {
    backgroundColor: '#FEF3C7',
    border: '1px solid #FCD34D',
    borderRadius: '16px',
    padding: '16px 20px',
    marginBottom: '28px',
  },
  section: {
    marginBottom: '28px',
    borderBottom: '1px solid #F3F4F6',
    paddingBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 12px',
  },
  methodBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: '14px',
    padding: '16px 20px',
    border: '1px solid #E5E7EB',
  },
  methodTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1F2937',
    margin: '0 0 8px',
  },
  contactEmailBox: {
    display: 'inline-block',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D1D5DB',
    padding: '8px 14px',
    borderRadius: '8px',
    marginTop: '6px',
  },
  list: {
    paddingLeft: '20px',
    margin: '8px 0',
    lineHeight: '1.8',
    color: '#374151',
    fontSize: '14px',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#6B7280',
    paddingTop: '12px',
  },
};
