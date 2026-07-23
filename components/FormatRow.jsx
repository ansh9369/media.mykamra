// 'use client';

// import { motion } from 'framer-motion';
// import { Download, Disc3, Volume2, VolumeX } from 'lucide-react';
// import { formatBytes } from '@/lib/format';

// export default function FormatRow({ format, index, onDownload }) {
//   const hasAudio = format.hasAudio;
//   const label = format.resolution === 'audio only' ? 'Audio' : format.resolution;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 22, rotate: -1.2 }}
//       animate={{ opacity: 1, y: 0, rotate: 0 }}
//       exit={{ opacity: 0, y: -8 }}
//       transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
//       whileHover={{ y: -3, borderColor: 'var(--signal)' }}
//       style={{
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         gap: 16,
//         padding: '14px 18px',
//         background: 'var(--panel)',
//         border: '1px solid var(--line)',
//         borderRadius: 10,
//         transition: 'border-color 0.25s ease',
//       }}
//     >
//       <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
//           style={{
//             width: 34,
//             height: 34,
//             borderRadius: '50%',
//             display: 'grid',
//             placeItems: 'center',
//             background: 'var(--panel-hi)',
//             border: '1px solid var(--line)',
//             flexShrink: 0,
//           }}
//         >
//           <Disc3 size={16} color="var(--tape)" />
//         </motion.div>

//         <div style={{ minWidth: 0 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <span
//               style={{
//                 fontFamily: 'var(--font-display)',
//                 fontSize: 14,
//                 fontWeight: 700,
//                 color: 'var(--text-hi)',
//               }}
//             >
//               {label}
//             </span>
//             <span
//               style={{
//                 fontFamily: 'var(--font-display)',
//                 fontSize: 10.5,
//                 padding: '2px 6px',
//                 borderRadius: 4,
//                 background: 'var(--panel-hi)',
//                 color: 'var(--text-lo)',
//                 textTransform: 'uppercase',
//               }}
//             >
//               {format.ext}
//             </span>
//           </div>
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 6,
//               fontSize: 12.5,
//               color: 'var(--text-lo)',
//               marginTop: 3,
//             }}
//           >
//             {hasAudio ? (
//               <Volume2 size={12} color="var(--signal)" />
//             ) : (
//               <VolumeX size={12} />
//             )}
//             <span>{hasAudio ? 'with audio' : 'no audio'}</span>
//             <span>·</span>
//             <span>{formatBytes(format.filesizeApprox)}</span>
//           </div>
//         </div>
//       </div>

//       <motion.button
//         whileTap={{ scale: 0.94 }}
//         onClick={() => onDownload(format)}
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: 8,
//           padding: '9px 16px',
//           borderRadius: 8,
//           background: 'transparent',
//           border: '1px solid var(--signal)',
//           color: 'var(--signal)',
//           fontFamily: 'var(--font-display)',
//           fontSize: 12.5,
//           fontWeight: 700,
//           letterSpacing: 0.4,
//           flexShrink: 0,
//         }}
//       >
//         <Download size={14} />
//         PULL
//       </motion.button>
//     </motion.div>
//   );
// }

'use client';

import { motion } from 'framer-motion';
import { Download, Disc3, Volume2, VolumeX } from 'lucide-react';
import { formatBytes } from '@/lib/format';

export default function FormatRow({ format, index, onDownload }) {
  const hasAudio = format.hasAudio;
  const label = format.resolution === 'audio only' ? 'Audio' : format.resolution;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, rotate: -1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, borderColor: 'var(--signal)' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 18px',
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
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--panel-hi)',
            border: '1px solid var(--line)',
            flexShrink: 0,
          }}
        >
          <Disc3 size={16} color="var(--tape)" />
        </motion.div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-hi)',
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 10.5,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'var(--panel-hi)',
                color: 'var(--text-lo)',
                textTransform: 'uppercase',
              }}
            >
              {format.ext}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              color: 'var(--text-lo)',
              marginTop: 3,
            }}
          >
            {hasAudio ? (
              <Volume2 size={12} color="var(--signal)" />
            ) : (
              <VolumeX size={12} />
            )}
            <span>{hasAudio ? 'with audio' : 'no audio'}</span>
            <span>·</span>
            <span>{formatBytes(format.filesizeApprox)}</span>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => onDownload(format)}
        data-cursor="target"
        data-cursor-label={`PULL ${label}`}
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