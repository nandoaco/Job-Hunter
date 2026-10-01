
import React from 'react';
import { tokens } from '../styles/tokens';

export function SkeletonBox({ width = '100%', height = '16px', borderRadius = tokens.radii.sm, style = {} }) {
  return (
    <div
      className="skeleton-pulse"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: tokens.colors.surfaceAlt,
        ...style
      }}
    />
  );
}

export function SkeletonCard({ height = '140px' }) {
  return (
    <div
      style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.radii.lg,
        padding: tokens.spacing.lg,
        border: `1px solid ${tokens.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height
      }}
    >
      <SkeletonBox width="45%" height="14px" />
      <SkeletonBox width="30%" height="32px" />
      <SkeletonBox width="100%" height="8px" style={{ marginTop: 'auto' }} />
    </div>
  );
}

export function SkeletonFeedTable() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 0' }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: tokens.colors.surfaceAlt,
            borderRadius: tokens.radii.md,
            gap: '16px'
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <SkeletonBox width="60%" height="16px" />
            <SkeletonBox width="40%" height="12px" />
          </div>
          <SkeletonBox width="110px" height="24px" borderRadius={tokens.radii.sm} />
          <SkeletonBox width="48px" height="24px" borderRadius={tokens.radii.sm} />
          <SkeletonBox width="70px" height="28px" borderRadius={tokens.radii.sm} />
        </div>
      ))}
    </div>
  );
}