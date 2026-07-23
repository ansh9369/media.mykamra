// 'use client';

// import { Radio } from 'lucide-react';

// export default function Navbar() {
//   return (
//     <header
//       style={{
//         position: 'sticky',
//         top: 0,
//         zIndex: 50,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: '22px 32px',
//         borderBottom: '1px solid var(--line)',
//         background: 'rgba(11, 14, 17, 0.82)',
//         backdropFilter: 'blur(10px)',
//       }}
//     >
//       <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//         <Radio size={18} color="var(--signal)" />
//         <span
//           style={{
//             fontFamily: 'var(--font-display)',
//             fontWeight: 800,
//             fontSize: 15,
//             letterSpacing: 1.5,
//           }}
//         >
//           SIGNAL DECK
//         </span>
//       </div>

//       <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
//         <a href="#how" style={navLink}>How it works</a>
//         <a href="#features" style={navLink}>Features</a>
//         <a
//           href="#deck"
//           style={{
//             padding: '9px 18px',
//             borderRadius: 8,
//             border: '1px solid var(--signal)',
//             color: 'var(--signal)',
//             fontFamily: 'var(--font-display)',
//             fontSize: 12.5,
//             fontWeight: 700,
//             letterSpacing: 0.4,
//             textDecoration: 'none',
//           }}
//         >
//           OPEN DECK
//         </a>
//       </nav>
//     </header>
//   );
// }

// const navLink = {
//   color: 'var(--text-lo)',
//   fontSize: 14,
//   textDecoration: 'none',
// };


'use client';

import { Radio } from 'lucide-react';

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
        padding: '22px 32px',
        borderBottom: '1px solid var(--line)',
        background: 'rgba(11, 14, 17, 0.82)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Radio size={18} color="var(--signal)" />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: 1.5,
          }}
        >
          SIGNAL DECK
        </span>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <a href="#how" style={navLink}>How it works</a>
        <a href="#features" style={navLink}>Features</a>
        <a
          href="#deck"
          data-cursor="target"
          data-cursor-label="OPEN"
          style={{
            padding: '9px 18px',
            borderRadius: 8,
            border: '1px solid var(--signal)',
            color: 'var(--signal)',
            fontFamily: 'var(--font-display)',
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: 0.4,
            textDecoration: 'none',
          }}
        >
          OPEN DECK
        </a>
      </nav>
    </header>
  );
}

const navLink = {
  color: 'var(--text-lo)',
  fontSize: 14,
  textDecoration: 'none',
};