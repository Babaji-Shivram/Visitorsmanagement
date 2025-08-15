import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { joinApi } from "./lib/apiBase";

if (typeof window !== "undefined") {
  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = typeof input === "string" ? input : (input as URL).toString();
      if (/^\/(staff|locations|roleconfiguration|auth\/.*)/i.test(url)) {
        const fixed = joinApi(url);
        return originalFetch(fixed, init);
      }
    } catch {}
    return originalFetch(input as any, init);
  }) as any;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
