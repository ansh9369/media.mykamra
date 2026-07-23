'use client';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        padding: '28px 32px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 12,
          letterSpacing: 1,
          color: 'var(--text-lo)',
        }}
      >
        SIGNAL DECK
      </span>
      <span style={{ fontSize: 12.5, color: 'var(--text-lo)' }}>
        Only download content you have the right to save.
      </span>
    </footer>
  );
}
