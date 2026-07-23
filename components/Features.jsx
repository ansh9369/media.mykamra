'use client';

import { motion } from 'framer-motion';
import { Gauge, Layers, AudioLines, ShieldCheck } from 'lucide-react';
import { SectionEyebrow } from './HowItWorks';

const features = [
  {
    icon: Gauge,
    title: 'Reads fast',
    body: 'Signal detection typically resolves in a couple seconds, even on longer videos.',
  },
  {
    icon: Layers,
    title: 'Every quality, one list',
    body: 'All available resolutions surface at once — no digging through menus.',
  },
  {
    icon: AudioLines,
    title: 'Audio-only pulls',
    body: 'Need just the sound? Pull an MP3 without touching the video track.',
  },
  {
    icon: ShieldCheck,
    title: 'Nothing stored',
    body: 'Links are read, not logged. The deck doesn\u2019t keep a history of what you pull.',
  },
];

export default function Features() {
  return (
    <section
      id="features"
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: '80px 24px',
        borderTop: '1px solid var(--line)',
      }}
    >
      <SectionEyebrow>WHAT'S ON THE DECK</SectionEyebrow>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 3.5vw, 34px)',
          fontWeight: 800,
          margin: 0,
          letterSpacing: -0.4,
        }}
      >
        Built to be quiet about the hard part.
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 22,
          marginTop: 44,
        }}
      >
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ borderColor: 'var(--signal)' }}
              style={{
                padding: '24px 22px',
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: 12,
                transition: 'border-color 0.25s ease',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--panel-hi)',
                  border: '1px solid var(--line)',
                  marginBottom: 16,
                }}
              >
                <Icon size={17} color="var(--signal)" />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15.5,
                  fontWeight: 700,
                  margin: '0 0 8px',
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: 'var(--text-lo)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
                {f.body}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
