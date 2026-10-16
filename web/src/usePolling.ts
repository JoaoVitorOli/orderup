import { useEffect, useRef } from 'react';

// Stand-in for the WebSocket gateway: runs `fn` now and then every `ms`.
export function usePolling(fn: () => void, ms: number, enabled = true) {
  const saved = useRef(fn);
  saved.current = fn;

  useEffect(() => {
    if (!enabled) return;
    saved.current();
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms, enabled]);
}
