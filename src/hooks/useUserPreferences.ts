
"use client";

import { useState, useEffect, useCallback } from 'react';

const TAMPERMONKEY_URL_KEY = 'prompt-amplifier-tampermonkey-url';

export function useUserPreferences() {
  const [tampermonkeyUrl, setTampermonkeyUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUrl = window.localStorage.getItem(TAMPERMONKEY_URL_KEY);
      if (storedUrl) {
        setTampermonkeyUrl(storedUrl);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveTampermonkeyUrl = useCallback((url: string) => {
    try {
      window.localStorage.setItem(TAMPERMONKEY_URL_KEY, url);
      setTampermonkeyUrl(url);
    } catch (error) {
      console.error("Could not save to localStorage:", error);
    }
  }, []);

  return { tampermonkeyUrl, saveTampermonkeyUrl, isLoaded };
}
