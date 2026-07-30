'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, Cpu, Cloud, Code, ArrowUpRight } from 'lucide-react';
import { SectionEyebrow } from './HowItWorks';

const ecosystemFeatures = [
  {
    icon: Sparkles,
    badge: 'MYKAMRA.IN MAIN PLATFORM',
    title: 'AI Content & Media Studio',
    body: 'Generate, edit, and enhance content with powerful AI models directly on the main MyKamra platform.',
    linkText: 'Explore AI Studio',
    url: 'https://www.mykamra.in/',
  },
  {
    icon: Cpu,
    badge: 'MEDIA.MYKAMRA.IN ENGINE',
    title: 'Ultra Fast 4K Signal Extractor',
    body: 'Extract losslessly in 4K, 1080p, 720p, or high-bitrate MP3 audio with instant zero-watermark downloads.',
    linkText: 'Use Extractor Now',
    url: '#deck',
    isAnchor: true,
  },
  {
    icon: Cloud,
    badge: 'CLOUD STORAGE & WORKSPACE',
    title: 'Unified Media Hub',
    body: 'Organize your media assets, store extracted videos, and collaborate with teams seamlessly.',
    linkText: 'Visit MyKamra Workspace',
    url: 'https://www.mykamra.in/',
  },
  {
    icon: Code,
    badge: 'CREATOR API & TOOLS',
    title: 'Developer & Automation Suite',
    body: 'Integrate automated media scraping, video conversion, and processing APIs into your workflow.',
    linkText: 'Check Developer Suite',
    url: 'https://www.mykamra.in/',
  },
];

export default function MyKamraEcosystem() {
  return (
    <section
      id="mykamra-ecosystem"
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: '88px 24px',
        borderTop: '1px solid var(--line)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
        <SectionEyebrow>POWERED BY MYKAMRA.IN</SectionEyebrow>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 800,
            margin: '0 0 16px',
            letterSpacing: -0.5,
          }}
        >
          Part of the <span style={{ color: 'var(--signal)' }}>MyKamra</span> Suite
        </h2>
        <p style={{ color: 'var(--text-lo)', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: 'var(--text-hi)' }}>media.mykamra.in</strong> is the dedicated high-speed media processing subdomain of{' '}
          <a
            href="https://www.mykamra.in/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--signal)', textDecoration: 'underline' }}
          >
            mykamra.in
          </a>
          . Discover all tools, AI features, and cloud capabilities available on our main portal.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}
      >
        {ecosystemFeatures.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{ y: -4, borderColor: 'var(--signal)' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px 24px',
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                transition: 'all 0.25s ease',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'var(--panel-hi)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <Icon size={20} color="var(--signal)" />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      color: 'var(--tape)',
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: '#E8A94C18',
                      border: '1px solid #E8A94C33',
                    }}
                  >
                    {f.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 700,
                    margin: '0 0 10px',
                    color: 'var(--text-hi)',
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: 'var(--text-lo)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
                  {f.body}
                </p>
              </div>

              <a
                href={f.url}
                target={f.isAnchor ? '_self' : '_blank'}
                rel={f.isAnchor ? '' : 'noopener noreferrer'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: 'var(--font-display)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--signal)',
                  textDecoration: 'none',
                  marginTop: 'auto',
                }}
              >
                {f.linkText}
                {f.isAnchor ? <ArrowUpRight size={14} /> : <ExternalLink size={14} />}
              </a>
            </motion.div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 48,
          textAlign: 'center',
          padding: '24px 32px',
          background: 'var(--panel-hi)',
          borderRadius: 12,
          border: '1px solid var(--line)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            Want to visit the official MyKamra website?
          </div>
          <div style={{ color: 'var(--text-lo)', fontSize: 13.5, marginTop: 2 }}>
            Access all features, tools, and documentation at https://www.mykamra.in/
          </div>
        </div>

        <a
          href="https://www.mykamra.in/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 22px',
            borderRadius: 8,
            background: 'var(--signal)',
            color: 'var(--void)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 0.5,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          GO TO MYKAMRA.IN
          <ExternalLink size={15} />
        </a>
      </div>
    </section>
  );
}
