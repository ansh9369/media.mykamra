'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    n: '01',
    title: 'Drop the link',
    body: 'Paste any video link into the deck. Nothing to install, nothing to sign into.',
  },
  {
    n: '02',
    title: 'Read the signal',
    body: 'The deck decodes what\u2019s available — resolutions, formats, audio-only.',
  },
  {
    n: '03',
    title: 'Pull the tape',
    body: 'Pick a format and it lands straight in your downloads folder.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: '80px 24px',
        borderTop: '1px solid var(--line)',
      }}
    >
      <SectionEyebrow>THE SEQUENCE</SectionEyebrow>
      <h2 style={headingStyle}>Three steps, in order.</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 28,
          marginTop: 44,
        }}
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            style={{
              padding: '28px 24px',
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              position: 'relative',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 34,
                fontWeight: 800,
                color: 'var(--signal-dim)',
                lineHeight: 1,
                marginBottom: 18,
              }}
            >
              {step.n}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 17,
                fontWeight: 700,
                margin: '0 0 10px',
              }}
            >
              {step.title}
            </h3>
            <p style={{ color: 'var(--text-lo)', fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>
              {step.body}
            </p>
            {i < steps.length - 1 && (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: -28,
                  width: 28,
                  height: 1,
                  background: 'var(--line)',
                  display: 'none',
                }}
                className="step-connector"
              />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function SectionEyebrow({ children }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 12,
        letterSpacing: 2,
        color: 'var(--tape)',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

const headingStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(24px, 3.5vw, 34px)',
  fontWeight: 800,
  margin: 0,
  letterSpacing: -0.4,
};
