'use client';

import { useEffect, useState } from 'react';

import { ASCII_FRAMES } from '@/constants/ascii.constants';

export const MainAsciiLoading = () => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % ASCII_FRAMES.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className='pointer-events-none flex h-20 items-center justify-center overflow-hidden select-none'
      style={{ zIndex: 10, backgroundColor: 'transparent' }}
    >
      <pre
        className='font-mono text-[14px] leading-tight text-zinc-500'
        style={{
          whiteSpace: 'pre',
          fontFamily: 'monospace',
          opacity: 0.8,
        }}
      >
        {ASCII_FRAMES[frameIndex]}
      </pre>
    </div>
  );
};
