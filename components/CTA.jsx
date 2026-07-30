'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

export default function CTA() {
  return (
    <section
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: '80px 24px 96px',
        borderTop: '1px solid var(--line)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45 }}
        style={{
          padding: '56px 40px',
          borderRadius: 16,
          border: '1px solid var(--line)',
          background:
            'radial-gradient(ellipse 120% 100% at 50% 0%, #4CE0D21F, var(--panel))',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.2,
            color: 'var(--tape)',
            marginBottom: 12,
          }}
        >
          SUBDOMAIN TOOL FOR MYKAMRA.IN
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800,
            margin: '0 0 14px',
            letterSpacing: -0.4,
          }}
        >
          Ready to extract high-quality media?
        </h2>
        <p style={{ color: 'var(--text-lo)', fontSize: 16, margin: '0 0 32px', maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
          No sign-up required. Powered by the high-performance media infrastructure of MyKamra.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <motion.a
            href="#deck"
            whileTap={{ scale: 0.96 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 28px',
              borderRadius: 9,
              background: 'var(--signal)',
              color: 'var(--void)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 13.5,
              letterSpacing: 0.4,
              textDecoration: 'none',
            }}
          >
            USE EXTRACTOR DECK
            <ArrowUpRight size={16} />
          </motion.a>

          <motion.a
            href="https://www.mykamra.in/"
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.96 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 28px',
              borderRadius: 9,
              background: 'var(--panel-hi)',
              border: '1px solid var(--line)',
              color: 'var(--text-hi)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 13.5,
              letterSpacing: 0.4,
              textDecoration: 'none',
            }}
          >
            VISIT MYKAMRA.IN
            <ExternalLink size={16} color="var(--signal)" />
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}