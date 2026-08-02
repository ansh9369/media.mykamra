'use client';

import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        background: 'var(--panel)',
        padding: '56px 32px 32px',
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40,
          paddingBottom: 40,
          borderBottom: '1px solid var(--line)',
        }}
      >
        {/* Col 1 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <img
            src="/saveTube.png"
            alt="SaveTube - MyKamra Logo"
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              objectFit: 'contain',
            }}
          />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: 1.2,
                color: 'var(--text-hi)',
              }}
            >
              MYKAMRA MEDIA
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-lo)', lineHeight: 1.6, margin: '0 0 16px' }}>
            Official media extraction hub on <strong style={{ color: 'var(--signal)' }}>media.mykamra.in</strong> for the main platform{' '}
            <a
              href="https://www.mykamra.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-hi)', textDecoration: 'underline' }}
            >
              mykamra.in
            </a>
            .
          </p>
          <a
            href="https://www.mykamra.in/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: 'var(--signal)',
              textDecoration: 'none',
            }}
          >
            Visit Website (mykamra.in)
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Col 2 */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              color: 'var(--text-hi)',
              marginBottom: 16,
            }}
          >
            MEDIA TOOLS
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
            <li>
              <a href="#deck" style={footerLink}>
                YouTube 4K Extractor
              </a>
            </li>
            <li>
              <a href="#deck" style={footerLink}>
                MP3 Audio Puller
              </a>
            </li>
            <li>
              <a href="#how" style={footerLink}>
                Signal Processing Pipeline
              </a>
            </li>
            <li>
              <a href="#features" style={footerLink}>
                No Watermark Engine
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              color: 'var(--text-hi)',
              marginBottom: 16,
            }}
          >
            MYKAMRA PLATFORM
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
            <li>
              <a href="https://www.mykamra.in/" target="_blank" rel="noopener noreferrer" style={footerLink}>
                Official Portal (mykamra.in)
              </a>
            </li>
            <li>
              <a href="https://www.mykamra.in/" target="_blank" rel="noopener noreferrer" style={footerLink}>
                AI Content Studio
              </a>
            </li>
            <li>
              <a href="https://www.mykamra.in/" target="_blank" rel="noopener noreferrer" style={footerLink}>
                Cloud Media Workspace
              </a>
            </li>
            <li>
              <a href="https://www.mykamra.in/" target="_blank" rel="noopener noreferrer" style={footerLink}>
                Developer APIs & Docs
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: 1040,
          margin: '24px auto 0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontSize: 12.5,
          color: 'var(--text-lo)',
        }}
      >
        <div>
          © {new Date().getFullYear()} <strong style={{ color: 'var(--text-hi)' }}>MyKamra Inc.</strong> All rights reserved. Subdomain: <strong>media.mykamra.in</strong>
        </div>
        <div>Only download content you have explicit rights to save.</div>
      </div>
    </footer>
  );
}

const footerLink = {
  color: 'var(--text-lo)',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
};
