import { useEffect, useState } from "react";

/** Mimics a network fetch so skeleton states are visible in the demo. */
export function useSimulatedLoad(ms = 450) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return loading;
}
