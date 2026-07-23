'use client';

import { motion } from 'framer-motion';
import { Eye, Calendar, User } from 'lucide-react';
import { formatDuration, formatViews, formatUploadDate } from '@/lib/format';

export default function VideoMeta({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        gap: 18,
        padding: 16,
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
          width: 180,
          aspectRatio: '16 / 9',
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--line)',
          background: 'var(--panel-hi)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.thumbnail}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 6,
            padding: '2px 6px',
            borderRadius: 4,
            background: '#0B0E11CC',
            fontFamily: 'var(--font-display)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          {formatDuration(data.duration)}
        </div>
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 700,
            margin: '2px 0 10px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {data.title}
        </h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px 16px',
            fontSize: 12.5,
            color: 'var(--text-lo)',
          }}
        >
          <MetaItem icon={User}>{data.uploader}</MetaItem>
          <MetaItem icon={Eye}>{formatViews(data.viewCount)}</MetaItem>
          <MetaItem icon={Calendar}>{formatUploadDate(data.uploadDate)}</MetaItem>
        </div>
      </div>
    </motion.div>
  );
}

function MetaItem({ icon: Icon, children }) {
  if (!children) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <Icon size={12.5} />
      {children}
    </span>
  );
}
