'use client';

import { motion } from 'framer-motion';
import { Download, Disc3 } from 'lucide-react';

export default function ResultReel({ option, index, onDownload }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: index * 0.09, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, borderColor: 'var(--signal)' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '16px 20px',
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        transition: 'border-color 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--panel-hi)',
            border: '1px solid var(--line)',
            flexShrink: 0,
          }}
        >
          <Disc3 size={18} color="var(--tape)" />
        </motion.div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-hi)',
            }}
          >
            {option.label}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-lo)', marginTop: 2 }}>
            {option.format} · {option.size}
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => onDownload(option)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          borderRadius: 8,
          background: 'transparent',
          border: '1px solid var(--signal)',
          color: 'var(--signal)',
          fontFamily: 'var(--font-display)',
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: 0.4,
          flexShrink: 0,
        }}
      >
        <Download size={14} />
        PULL
      </motion.button>
    </motion.div>
  );
}
