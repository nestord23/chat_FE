import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para limpieza automática de listeners
 * FASE 7: Previene memory leaks
 */
export const useCleanup = (cleanup: () => void, deps: React.DependencyList = []) => {
  const cleanupRef = useRef(cleanup);

  // Actualizar la función de cleanup cuando cambie
  useEffect(() => {
    cleanupRef.current = cleanup;
  }, [cleanup]);

  // Ejecutar cleanup al desmontar o cuando cambien las dependencias
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

/**
 * Hook para ejecutar una función solo una vez al montar
 * FASE 7: Útil para inicializaciones
 */
export const useMount = (fn: () => void | (() => void)) => {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      const cleanup = fn();

      // Si la función retorna una función de cleanup, ejecutarla al desmontar
      return () => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/**
 * Hook para ejecutar una función solo una vez al desmontar
 * FASE 7: Útil para limpieza final
 */
export const useUnmount = (fn: () => void) => {
  const fnRef = useRef(fn);

  // Actualizar la referencia cuando cambie la función
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      fnRef.current();
    };
  }, []);
};

/**
 * Hook para debounce
 * FASE 7: Optimiza funciones que se ejecutan frecuentemente
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para throttle
 * FASE 7: Limita la frecuencia de ejecución de funciones
 * ✅ CORREGIDO: Usa useCallback en lugar de retornar ref.current
 */
export const useThrottle = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T => {
  const lastRun = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ✅ Usar useCallback en lugar de ref
  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        fn(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          fn(...args);
          lastRun.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    },
    [fn, delay]
  ) as T;

  return throttledFn;
};

/**
 * Hook para prevenir múltiples ejecuciones
 * FASE 7: Útil para prevenir doble-click en botones
 * ✅ CORREGIDO: Usa useCallback en lugar de retornar ref.current
 */
export const usePreventMultiple = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T
): [T, boolean] => {
  const [isExecuting, setIsExecuting] = React.useState(false);

  // ✅ Usar useCallback en lugar de ref
  const wrappedFn = useCallback(
    async (...args: Parameters<T>) => {
      if (isExecuting) {
        console.warn('⚠️ Función ya en ejecución, ignorando...');
        return;
      }

      setIsExecuting(true);
      try {
        return await fn(...args);
      } finally {
        setIsExecuting(false);
      }
    },
    [fn, isExecuting]
  ) as T;

  return [wrappedFn, isExecuting];
};
