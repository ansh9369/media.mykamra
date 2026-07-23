'use client';

import { motion } from 'framer-motion';

export default function QualityTabs({ options, active, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 4,
      }}
    >
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              position: 'relative',
              padding: '7px 14px',
              borderRadius: 20,
              border: `1px solid ${isActive ? 'var(--signal)' : 'var(--line)'}`,
              color: isActive ? 'var(--signal)' : 'var(--text-lo)',
              fontFamily: 'var(--font-display)',
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'color 0.2s ease, border-color 0.2s ease',
            }}
          >
            {isActive && (
              <motion.span
                layoutId="quality-tab-bg"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 20,
                  background: 'var(--signal-dim)',
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
