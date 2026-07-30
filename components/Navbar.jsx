'use client';

import { Radio, ExternalLink } from 'lucide-react';

export default function Navbar() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid var(--line)',
        background: 'rgba(11, 14, 17, 0.88)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <a
          href="https://www.mykamra.in/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #4CE0D2, #E8A94C)',
              color: 'var(--void)',
              fontWeight: 800,
              fontSize: 16,
              fontFamily: 'var(--font-display)',
            }}
          >
            M
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 15,
                  letterSpacing: 1.2,
                  color: 'var(--text-hi)',
                }}
              >
                MYKAMRA
              </span>
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: '#4CE0D222',
                  color: 'var(--signal)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  border: '1px solid #4CE0D244',
                }}
              >
                MEDIA
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-lo)', fontFamily: 'var(--font-display)' }}>
              media.mykamra.in
            </span>
          </div>
        </a>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <a href="#deck" style={navLink}>
          Extractor
        </a>
        <a href="#how" style={navLink}>
          How It Works
        </a>
        <a href="#features" style={navLink}>
          Features
        </a>
        <a href="#mykamra-ecosystem" style={navLink}>
          MyKamra Platform
        </a>
        <a
          href="https://www.mykamra.in/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 18px',
            borderRadius: 8,
            border: '1px solid var(--signal)',
            background: '#4CE0D214',
            color: 'var(--signal)',
            fontFamily: 'var(--font-display)',
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: 0.4,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          VISIT MYKAMRA.IN
          <ExternalLink size={14} />
        </a>
      </nav>
    </header>
  );
}

const navLink = {
  color: 'var(--text-lo)',
  fontSize: 13.5,
  fontFamily: 'var(--font-display)',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
};