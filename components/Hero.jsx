// 'use client';

// import { useState, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Clipboard, ArrowRight, TriangleAlert } from 'lucide-react';
// import SignalWave from './SignalWave';
// import ResultReel from './ResultReel';
// import { mockProbe } from '@/lib/mockProbe';

// const STATE = { IDLE: 'idle', SCANNING: 'scanning', LOCKED: 'locked', ERROR: 'error' };

// export default function Hero() {
//   const [url, setUrl] = useState('');
//   const [state, setState] = useState(STATE.IDLE);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState('');
//   const inputRef = useRef(null);

//   async function handlePull() {
//     if (!url.trim()) return;
//     setError('');
//     setResult(null);
//     setState(STATE.SCANNING);
//     try {
//       const data = await mockProbe(url.trim());
//       setResult(data);
//       setState(STATE.LOCKED);
//     } catch (e) {
//       setError(e.message || 'Couldn\u2019t read that signal.');
//       setState(STATE.ERROR);
//     }
//   }

//   async function handlePaste() {
//     try {
//       const text = await navigator.clipboard.readText();
//       setUrl(text);
//       inputRef.current?.focus();
//     } catch {
//       inputRef.current?.focus();
//     }
//   }

//   function handleDownload(option) {
//     console.log('download requested:', option);
//   }

//   return (
//     <section
//       id="deck"
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         padding: '88px 24px 96px',
//         gap: 48,
//       }}
//     >
//       <div style={{ textAlign: 'center', maxWidth: 680 }}>
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           style={{
//             display: 'inline-block',
//             padding: '5px 12px',
//             borderRadius: 20,
//             border: '1px solid var(--line)',
//             fontFamily: 'var(--font-display)',
//             fontSize: 11,
//             letterSpacing: 1,
//             color: 'var(--tape)',
//             marginBottom: 20,
//           }}
//         >
//           NO SIGN-UP · NO WATERMARK
//         </motion.div>
//         <motion.h1
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.06 }}
//           style={{
//             fontFamily: 'var(--font-display)',
//             fontSize: 'clamp(32px, 5.5vw, 52px)',
//             fontWeight: 800,
//             lineHeight: 1.12,
//             margin: 0,
//             letterSpacing: -0.5,
//           }}
//         >
//           Drop a link.{' '}
//           <span style={{ color: 'var(--signal)' }}>Pull the tape.</span>
//         </motion.h1>
//         <motion.p
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.12 }}
//           style={{ color: 'var(--text-lo)', fontSize: 17, marginTop: 16 }}
//         >
//           Paste a video link, let the deck read the signal, then choose the
//           format and quality you want to keep.
//         </motion.p>
//       </div>

//       <SignalWave locked={state === STATE.LOCKED} />

//       <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 18 }}>
//         <div
//           style={{
//             display: 'flex',
//             gap: 10,
//             padding: 8,
//             background: 'var(--panel)',
//             border: '1px solid var(--line)',
//             borderRadius: 12,
//           }}
//         >
//           <button
//             onClick={handlePaste}
//             title="Paste from clipboard"
//             style={{ display: 'grid', placeItems: 'center', width: 44, borderRadius: 8, color: 'var(--text-lo)' }}
//           >
//             <Clipboard size={17} />
//           </button>
//           <input
//             ref={inputRef}
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handlePull()}
//             placeholder="https://…"
//             style={{
//               flex: 1,
//               background: 'transparent',
//               border: 'none',
//               color: 'var(--text-hi)',
//               fontFamily: 'var(--font-display)',
//               fontSize: 14,
//               padding: '0 4px',
//             }}
//           />
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={handlePull}
//             disabled={state === STATE.SCANNING}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 8,
//               padding: '0 20px',
//               borderRadius: 8,
//               background: 'var(--signal)',
//               color: 'var(--void)',
//               fontFamily: 'var(--font-display)',
//               fontWeight: 700,
//               fontSize: 13,
//               letterSpacing: 0.5,
//               opacity: state === STATE.SCANNING ? 0.6 : 1,
//             }}
//           >
//             {state === STATE.SCANNING ? 'READING…' : 'PULL'}
//             {state !== STATE.SCANNING && <ArrowRight size={15} />}
//           </motion.button>
//         </div>

//         <AnimatePresence mode="wait">
//           {state === STATE.ERROR && (
//             <motion.div
//               key="error"
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 10,
//                 padding: '12px 16px',
//                 background: '#E85C4C14',
//                 border: '1px solid var(--danger)',
//                 borderRadius: 10,
//                 color: 'var(--danger)',
//                 fontSize: 13.5,
//               }}
//             >
//               <TriangleAlert size={16} />
//               {error}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <AnimatePresence>
//           {result && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}
//             >
//               <div
//                 style={{
//                   fontFamily: 'var(--font-display)',
//                   fontSize: 12,
//                   letterSpacing: 1,
//                   color: 'var(--text-lo)',
//                   marginBottom: 2,
//                 }}
//               >
//                 {result.duration} · CHOOSE A FORMAT
//               </div>
//               {result.options.map((opt, i) => (
//                 <ResultReel key={opt.label} option={opt} index={i} onDownload={handleDownload} />
//               ))}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </section>
//   );
// }
// 'use client';

// import { useState, useRef, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Clipboard, ArrowRight, TriangleAlert } from 'lucide-react';
// import SignalWave from './SignalWave';
// import VideoMeta from './VideoMeta';
// import QualityTabs from './QualityTabs';
// import FormatRow from './FormatRow';
// import { mockProbe } from '@/lib/mockProbe';
// import { groupFormatsByResolution } from '@/lib/format';

// const STATE = { IDLE: 'idle', SCANNING: 'scanning', LOCKED: 'locked', ERROR: 'error' };
// const RES_ORDER = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p', 'audio only'];

// export default function Hero() {
//   const [url, setUrl] = useState('');
//   const [state, setState] = useState(STATE.IDLE);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('All');
//   const inputRef = useRef(null);

//   const tabs = useMemo(() => {
//     if (!result) return ['All'];
//     const present = [...new Set(result.formats.map((f) => f.resolution))].sort(
//       (a, b) => RES_ORDER.indexOf(a) - RES_ORDER.indexOf(b)
//     );
//     return ['All', ...present];
//   }, [result]);

//   const visibleFormats = useMemo(() => {
//     if (!result) return [];
//     const sorted = groupFormatsByResolution(result.formats).flatMap((g) => g.all);
//     if (activeTab === 'All') return sorted;
//     return sorted.filter((f) => f.resolution === activeTab);
//   }, [result, activeTab]);

//   async function handlePull() {
//     if (!url.trim()) return;
//     setError('');
//     setResult(null);
//     setActiveTab('All');
//     setState(STATE.SCANNING);
//     try {
//       const data = await mockProbe(url.trim());
//       setResult(data);
//       setState(STATE.LOCKED);
//     } catch (e) {
//       setError(e.message || 'Couldn\u2019t read that signal.');
//       setState(STATE.ERROR);
//     }
//   }

//   async function handlePaste() {
//     try {
//       const text = await navigator.clipboard.readText();
//       setUrl(text);
//       inputRef.current?.focus();
//     } catch {
//       inputRef.current?.focus();
//     }
//   }

//   function handleDownload(format) {
//     // Wire to format.downloadUrl from your real backend response.
//     console.log('download requested:', format);
//   }

//   return (
//     <section
//       id="deck"
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         padding: '88px 24px 96px',
//         gap: 44,
//       }}
//     >
//       <div style={{ textAlign: 'center', maxWidth: 680 }}>
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           style={{
//             display: 'inline-block',
//             padding: '5px 12px',
//             borderRadius: 20,
//             border: '1px solid var(--line)',
//             fontFamily: 'var(--font-display)',
//             fontSize: 11,
//             letterSpacing: 1,
//             color: 'var(--tape)',
//             marginBottom: 20,
//           }}
//         >
//           NO SIGN-UP · NO WATERMARK
//         </motion.div>
//         <motion.h1
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.06 }}
//           style={{
//             fontFamily: 'var(--font-display)',
//             fontSize: 'clamp(32px, 5.5vw, 52px)',
//             fontWeight: 800,
//             lineHeight: 1.12,
//             margin: 0,
//             letterSpacing: -0.5,
//           }}
//         >
//           Drop a link.{' '}
//           <span style={{ color: 'var(--signal)' }}>Pull the tape.</span>
//         </motion.h1>
//         <motion.p
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.12 }}
//           style={{ color: 'var(--text-lo)', fontSize: 17, marginTop: 16 }}
//         >
//           Paste a video link, let the deck read the signal, then choose the
//           format and quality you want to keep.
//         </motion.p>
//       </div>

//       <SignalWave locked={state === STATE.LOCKED} />

//       <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 18 }}>
//         <div
//           style={{
//             display: 'flex',
//             gap: 10,
//             padding: 8,
//             background: 'var(--panel)',
//             border: '1px solid var(--line)',
//             borderRadius: 12,
//           }}
//         >
//           <button
//             onClick={handlePaste}
//             title="Paste from clipboard"
//             style={{ display: 'grid', placeItems: 'center', width: 44, borderRadius: 8, color: 'var(--text-lo)' }}
//           >
//             <Clipboard size={17} />
//           </button>
//           <input
//             ref={inputRef}
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handlePull()}
//             placeholder="https://…"
//             style={{
//               flex: 1,
//               background: 'transparent',
//               border: 'none',
//               color: 'var(--text-hi)',
//               fontFamily: 'var(--font-display)',
//               fontSize: 14,
//               padding: '0 4px',
//             }}
//           />
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={handlePull}
//             disabled={state === STATE.SCANNING}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 8,
//               padding: '0 20px',
//               borderRadius: 8,
//               background: 'var(--signal)',
//               color: 'var(--void)',
//               fontFamily: 'var(--font-display)',
//               fontWeight: 700,
//               fontSize: 13,
//               letterSpacing: 0.5,
//               opacity: state === STATE.SCANNING ? 0.6 : 1,
//             }}
//           >
//             {state === STATE.SCANNING ? 'READING…' : 'PULL'}
//             {state !== STATE.SCANNING && <ArrowRight size={15} />}
//           </motion.button>
//         </div>

//         <AnimatePresence mode="wait">
//           {state === STATE.ERROR && (
//             <motion.div
//               key="error"
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 10,
//                 padding: '12px 16px',
//                 background: '#E85C4C14',
//                 border: '1px solid var(--danger)',
//                 borderRadius: 10,
//                 color: 'var(--danger)',
//                 fontSize: 13.5,
//               }}
//             >
//               <TriangleAlert size={16} />
//               {error}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <AnimatePresence>
//           {result && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}
//             >
//               <VideoMeta data={result} />

//               <QualityTabs options={tabs} active={activeTab} onChange={setActiveTab} />

//               <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                 <AnimatePresence mode="popLayout">
//                   {visibleFormats.map((format, i) => (
//                     <FormatRow
//                       key={format.formatId}
//                       format={format}
//                       index={i}
//                       onDownload={handleDownload}
//                     />
//                   ))}
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </section>
//   );
// }



'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, ArrowRight, TriangleAlert } from 'lucide-react';
import SignalWave from './SignalWave';
import VideoMeta from './VideoMeta';
import QualityTabs from './QualityTabs';
import FormatRow from './FormatRow';
// import TapeParallax from './TapeParallax';
import { probeVideo } from '@/lib/probe';
import { groupFormatsByResolution } from '@/lib/format';

const STATE = { IDLE: 'idle', SCANNING: 'scanning', LOCKED: 'locked', ERROR: 'error' };
const RES_ORDER = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p', 'audio only'];

export default function Hero() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState(STATE.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const inputRef = useRef(null);

  const tabs = useMemo(() => {
    if (!result) return ['All'];
    const present = [...new Set(result.formats.map((f) => f.resolution))].sort(
      (a, b) => RES_ORDER.indexOf(a) - RES_ORDER.indexOf(b)
    );
    return ['All', ...present];
  }, [result]);

  const visibleFormats = useMemo(() => {
    if (!result) return [];
    const sorted = groupFormatsByResolution(result.formats).flatMap((g) => g.all);
    if (activeTab === 'All') return sorted;
    return sorted.filter((f) => f.resolution === activeTab);
  }, [result, activeTab]);

  async function handlePull() {
    if (!url.trim()) return;
    setError('');
    setResult(null);
    setActiveTab('All');
    setState(STATE.SCANNING);
    try {
      const data = await probeVideo(url.trim());
      setResult(data);
      setState(STATE.LOCKED);
    } catch (e) {
      setError(e.message || 'Couldn\u2019t read that signal.');
      setState(STATE.ERROR);
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      inputRef.current?.focus();
    } catch {
      inputRef.current?.focus();
    }
  }

  function handleDownload(format) {
    if (format.downloadUrl && format.downloadUrl !== '#') {
      window.open(format.downloadUrl, '_blank');
    } else if (result?.id) {
      window.open(`https://www.youtube.com/watch?v=${result.id}`, '_blank');
    }
  }

  return (
    <section
      id="deck"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '88px 24px 96px',
        gap: 44,
      }}
    >
      {/* <TapeParallax /> */}

      <div style={{ textAlign: 'center', maxWidth: 700 }}>
        <motion.a
          href="https://www.mykamra.in/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 20,
            border: '1px solid #E8A94C44',
            background: '#E8A94C12',
            fontFamily: 'var(--font-display)',
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: 'var(--tape)',
            marginBottom: 22,
            textDecoration: 'none',
          }}
        >
          <span>OFFICIAL SUBDOMAIN</span>
          <span style={{ color: 'var(--text-lo)' }}>·</span>
          <span>MEDIA.MYKAMRA.IN</span>
        </motion.a>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5.5vw, 54px)',
            fontWeight: 800,
            lineHeight: 1.12,
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          Drop a link.{' '}
          <span style={{ color: 'var(--signal)' }}>Pull the tape.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{ color: 'var(--text-lo)', fontSize: 16.5, marginTop: 16, lineHeight: 1.55 }}
        >
          Powered by <strong style={{ color: 'var(--text-hi)' }}>MyKamra</strong>. Paste any video link, let the signal processor extract all 4K, 1080p, and MP3 formats instantly.
        </motion.p>
      </div>

      <SignalWave locked={state === STATE.LOCKED} />

      <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            padding: 8,
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 12,
          }}
        >
          <button
            onClick={handlePaste}
            title="Paste from clipboard"
            data-cursor="target"
            data-cursor-label="PASTE"
            style={{ display: 'grid', placeItems: 'center', width: 44, borderRadius: 8, color: 'var(--text-lo)' }}
          >
            <Clipboard size={17} />
          </button>
          <input
            ref={inputRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePull()}
            placeholder="https://…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-hi)',
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              padding: '0 4px',
            }}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePull}
            disabled={state === STATE.SCANNING}
            data-cursor="target"
            data-cursor-label="PULL"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 20px',
              borderRadius: 8,
              background: 'var(--signal)',
              color: 'var(--void)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 0.5,
              opacity: state === STATE.SCANNING ? 0.6 : 1,
            }}
          >
            {state === STATE.SCANNING ? 'READING…' : 'PULL'}
            {state !== STATE.SCANNING && <ArrowRight size={15} />}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {state === STATE.ERROR && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: '#E85C4C14',
                border: '1px solid var(--danger)',
                borderRadius: 10,
                color: 'var(--danger)',
                fontSize: 13.5,
              }}
            >
              <TriangleAlert size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}
            >
              <VideoMeta data={result} />

              <QualityTabs options={tabs} active={activeTab} onChange={setActiveTab} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatePresence mode="popLayout">
                  {visibleFormats.map((format, i) => (
                    <FormatRow
                      key={format.formatId}
                      format={format}
                      index={i}
                      onDownload={handleDownload}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}