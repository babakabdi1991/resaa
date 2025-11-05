import React, { useEffect, PropsWithChildren } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

const rtlCache = createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });

const RtlProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const previousDir = document.documentElement.getAttribute('dir') || '';
    if (previousDir !== 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
    return () => {
      if (previousDir) {
        document.documentElement.setAttribute('dir', previousDir);
      } else {
        document.documentElement.removeAttribute('dir');
      }
    };
  }, []);

  return <CacheProvider value={rtlCache}>{children}</CacheProvider>;
};

export default RtlProvider;


