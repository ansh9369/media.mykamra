'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

/**
 * SignalWave — idle noisy waveform that "locks on" to a clean sine
 * when `locked` becomes true. The page's signature moment.
 */
export default function SignalWave({ locked = false, width = 900, height = 160 }) {
  const pathRef = useRef(null);
  const controls = useAnimation();
  const points = 64;

  function buildPath(seed, amplitude, noisy) {
    const step = width / (points - 1);
    let d = '';
    for (let i = 0; i < points; i++) {
      const x = i * step;
      const base = Math.sin((i / points) * Math.PI * 4 + seed) * amplitude;
      const jitter = noisy ? (Math.sin(i * 12.9898 + seed * 78.233) * 10000 % 1) * 14 - 7 : 0;
      const y = height / 2 + base + jitter;
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `;
    }
    return d;
  }

  useEffect(() => {
    let raf;
    let t = 0;
    const animate = () => {
      t += locked ? 0.05 : 0.09;
      const amp = locked ? 34 : 22;
      const d = buildPath(t, amp, !locked);
      if (pathRef.current) pathRef.current.setAttribute('d', d);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  useEffect(() => {
    if (locked) {
      controls.start({
        opacity: [1, 0.3, 1],
        transition: { duration: 0.35, times: [0, 0.4, 1] },
      });
    }
  }, [locked, controls]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: width }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={i}
            x1={0}
            x2={width}
            y1={(height / 4) * i}
            y2={(height / 4) * i}
            stroke="var(--line)"
            strokeWidth="1"
          />
        ))}
        <motion.path
          ref={pathRef}
          fill="none"
          stroke={locked ? 'var(--signal)' : 'var(--text-lo)'}
          strokeWidth={locked ? 2.5 : 1.5}
          strokeLinecap="round"
          animate={controls}
          style={{
            filter: locked ? 'drop-shadow(0 0 6px var(--signal))' : 'none',
            transition: 'stroke 0.4s ease',
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 4,
          fontFamily: 'var(--font-display)',
          fontSize: 11,
          letterSpacing: 1,
          color: locked ? 'var(--signal)' : 'var(--text-lo)',
          transition: 'color 0.4s ease',
        }}
      >
        {locked ? '● SIGNAL LOCKED' : '○ SCANNING…'}
      </div>
    </div>
  );
}
