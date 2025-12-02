import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedvalue, setDebouncevalue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncevalue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedvalue;
}
