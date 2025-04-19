import { useState, useEffect } from 'react';

const useDebounce = <T>(value: T, delay: number, immediate = false): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    if (immediate && isFirst) {
      setDebouncedValue(value);
      setIsFirst(false);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsFirst(true);
    }, delay);

    return () => {
      clearTimeout(handler);
      if (!immediate) setIsFirst(true);
    };
  }, [value, delay, immediate, isFirst]);

  return debouncedValue;
};

export default useDebounce;