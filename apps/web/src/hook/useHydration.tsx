"use client";

import { useEffect, useState } from "react";

type PersistableStore = {
  persist: {
    onFinishHydration: (callback: () => void) => () => void;
    hasHydrated: () => boolean;
  };
};

export function useHydration<T extends PersistableStore>(store: T): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (store.persist.hasHydrated()) {
      setTimeout(() => setHydrated(true), 0);
    }
    
    return store.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, [store]);

  return hydrated;
}
