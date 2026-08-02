'use client';

import { motion } from 'framer-motion';
import { Download, Disc3, Volume2, VolumeX, Loader2, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '@/lib/format';

export default function FormatRow({ format, index, onDownload, isDownloading, jobProgress }) {
  const hasAudio = format.hasAudio;
  const label = format.resolution === 'audio only' ? 'Audio' : format.resolution;

  const progressPct = jobProgress?.progress || 0;
  const progressStage = jobProgress?.stage || 'PULLING…';
  const isCompleted = jobProgress?.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, rotate: -1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, borderColor: 'var(--signal)' }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '14px 18px',
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
              {format.hasVideo && hasAudio && (
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: '#22c55e1a',
                    color: '#22c55e',
                    border: '1px solid #22c55e33',
                  }}
                >
                  Video + Audio
                </span>
              )}
              {!format.hasVideo && hasAudio && (
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: '#3b82f61a',
                    color: '#3b82f6',
                    border: '1px solid #3b82f633',
                  }}
                >
                  Audio Only
                </span>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                color: 'var(--text-lo)',
                marginTop: 4,
              }}
            >
              {hasAudio ? (
                <Volume2 size={13} color={format.hasVideo ? '#22c55e' : '#3b82f6'} />
              ) : (
                <VolumeX size={13} />
              )}
              <span>{hasAudio ? (format.hasVideo ? 'Full Sound & Video' : 'Audio Track Only') : 'No Audio Track'}</span>
              <span>·</span>
              <span>{formatBytes(format.filesizeApprox)}</span>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => !isDownloading && onDownload(format)}
          disabled={isDownloading}
          data-cursor="target"
          data-cursor-label={`PULL ${label}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 8,
            background: isDownloading ? 'var(--panel-hi)' : 'transparent',
            border: `1px solid ${isDownloading ? 'var(--text-lo)' : 'var(--signal)'}`,
            color: isDownloading ? 'var(--text-lo)' : 'var(--signal)',
            fontFamily: 'var(--font-display)',
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: 0.4,
            flexShrink: 0,
            cursor: isDownloading ? 'not-allowed' : 'pointer',
            opacity: isDownloading ? 0.7 : 1,
          }}
        >
          {isDownloading ? (
            isCompleted ? (
              <>
                <CheckCircle2 size={14} color="#22c55e" />
                READY!
              </>
            ) : (
              <>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                PULLING {progressPct}%
              </>
            )
          ) : (
            <>
              <Download size={14} />
              PULL
            </>
          )}
        </motion.button>
      </div>

      {isDownloading && (
        <div style={{ marginTop: 2 }}>
          <div
            style={{
              height: 4,
              width: '100%',
              background: 'var(--panel-hi)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
              style={{
                height: '100%',
                background: 'var(--signal)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-lo)', marginTop: 4 }}>
            <span>{progressStage}</span>
            <span>{progressPct}%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}