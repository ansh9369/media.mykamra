// 'use client';

// import { motion } from 'framer-motion';
// import { ArrowUpRight } from 'lucide-react';

// export default function CTA() {
//   return (
//     <section
//       style={{
//         maxWidth: 1040,
//         margin: '0 auto',
//         padding: '80px 24px 96px',
//         borderTop: '1px solid var(--line)',
//       }}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 18 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true, margin: '-60px' }}
//         transition={{ duration: 0.45 }}
//         style={{
//           padding: '52px 40px',
//           borderRadius: 16,
//           border: '1px solid var(--line)',
//           background:
//             'radial-gradient(ellipse 120% 100% at 50% 0%, #4CE0D21A, var(--panel))',
//           textAlign: 'center',
//         }}
//       >
//         <h2
//           style={{
//             fontFamily: 'var(--font-display)',
//             fontSize: 'clamp(24px, 4vw, 34px)',
//             fontWeight: 800,
//             margin: '0 0 14px',
//             letterSpacing: -0.4,
//           }}
//         >
//           Ready to pull your first tape?
//         </h2>
//         <p style={{ color: 'var(--text-lo)', fontSize: 15.5, margin: '0 0 28px' }}>
//           No account. No install. Just a link.
//         </p>
//         <motion.a
//           href="#deck"
//           whileTap={{ scale: 0.96 }}
//           style={{
//             display: 'inline-flex',
//             alignItems: 'center',
//             gap: 8,
//             padding: '13px 26px',
//             borderRadius: 9,
//             background: 'var(--signal)',
//             color: 'var(--void)',
//             fontFamily: 'var(--font-display)',
//             fontWeight: 700,
//             fontSize: 13.5,
//             letterSpacing: 0.4,
//             textDecoration: 'none',
//           }}
//         >
//           OPEN THE DECK
//           <ArrowUpRight size={15} />
//         </motion.a>
//       </motion.div>
//     </section>
//   );
// }
'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

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
          padding: '52px 40px',
          borderRadius: 16,
          border: '1px solid var(--line)',
          background:
            'radial-gradient(ellipse 120% 100% at 50% 0%, #4CE0D21A, var(--panel))',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 4vw, 34px)',
            fontWeight: 800,
            margin: '0 0 14px',
            letterSpacing: -0.4,
          }}
        >
          Ready to pull your first tape?
        </h2>
        <p style={{ color: 'var(--text-lo)', fontSize: 15.5, margin: '0 0 28px' }}>
          No account. No install. Just a link.
        </p>
        <motion.a
          href="#deck"
          whileTap={{ scale: 0.96 }}
          data-cursor="target"
          data-cursor-label="OPEN"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 26px',
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
          OPEN THE DECK
          <ArrowUpRight size={15} />
        </motion.a>
      </motion.div>
    </section>
  );
}