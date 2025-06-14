'use client';

import theme from '@/theme'; // カスタムテーマをインポート
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import { useServerInsertedHTML } from 'next/navigation';
import React from 'react';

// This component is based on the official MUI example for Next.js App Router SSR:
// https://github.com/mui/material-ui/blob/master/examples/nextjs-app-router-ts/src/components/ThemeRegistry/ThemeRegistry.tsx

// It sets up Emotion cache for Material-UI to work correctly with Next.js SSR.
// Styles are collected on the server and then injected into the HTML.

export default function ThemeRegistry(props: { children: React.ReactNode }) {
  const { children } = props;

  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ key: 'mui-style' });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
} 