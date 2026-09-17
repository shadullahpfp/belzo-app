# Security Policy

Belzo is committed to protecting our customers, delivery partners, and store operators. We take security vulnerabilities seriously and appreciate the community's efforts to responsibly disclose findings.

---

## Supported Versions

Only the latest release branches receive active security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

**DO NOT file public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability in this repository:

1. **Email us directly:** Send details to `security@belzo.com` (or contact repository administrators privately via GitHub Security Advisories).
2. **Include in your report:**
   - Detailed description of the vulnerability.
   - Exact steps to reproduce or Proof-of-Concept (PoC) payload.
   - Potential impact on user data, geolocation coordinates, or financial transactions.
   - Any remediation suggestions.

### Our Commitment
- We will acknowledge receipt of your vulnerability report within **48 hours**.
- We will provide a timeline for triage and patch deployment.
- We will notify you once the issue has been resolved and credit your contribution in release notes (if desired).

---

## Scope & Security Architecture

The following key vectors are continually monitored:
- **Supabase Row-Level Security (RLS)** policies governing `orders`, `profiles`, and `dark_stores`.
- **Secret Hygiene:** Ensuring no service-role keys or production tokens are exposed client-side.
- **PIN Verification:** Integrity of the 4-digit customer delivery validation mechanism.
- **Location Privacy:** Safeguarding real-time telemetry coordinates of fleet and customers.
