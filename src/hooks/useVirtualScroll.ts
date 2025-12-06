import { useEffect, useRef, useCallback, useState } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number; // Altura estimada de cada item
  containerHeight: number; // Altura del contenedor
  overscan?: number; // Número de items extra a renderizar arriba/abajo
}

/**
 * Hook para virtualización de listas
 * FASE 7: Optimiza renderizado de listas largas
 */
export const useVirtualScroll = <T>(items: T[], options: UseVirtualScrollOptions) => {
  const { itemHeight, containerHeight, overscan = 3 } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular índices visibles
  const visibleRange = useCallback(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const { startIndex, endIndex } = visibleRange();

  // Items visibles
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Altura total del contenedor virtual
  const totalHeight = items.length * itemHeight;

  // Offset del primer item visible
  const offsetY = startIndex * itemHeight;

  // Handler de scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Auto-scroll al final cuando se agregan nuevos items
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      scrollToBottom();
    }
  }, [items.length, scrollToBottom]);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToBottom,
    startIndex,
    endIndex,
  };
};

/**
 * Hook para scroll infinito (paginación)
 * FASE 7: Carga mensajes antiguos al hacer scroll arriba
 */
export const useInfiniteScroll = (
  onLoadMore: () => void | Promise<void>,
  options: {
    threshold?: number; // Distancia del top para cargar más
    hasMore?: boolean; // Si hay más items para cargar
    isLoading?: boolean; // Si está cargando actualmente
  } = {}
) => {
  const { threshold = 100, hasMore = true, isLoading = false } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container || !hasMore || isLoading || isLoadingRef.current) return;

    // Si está cerca del top, cargar más
    if (container.scrollTop < threshold) {
      isLoadingRef.current = true;

      try {
        await onLoadMore();
      } finally {
        isLoadingRef.current = false;
      }
    }
  }, [onLoadMore, threshold, hasMore, isLoading]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { containerRef };
};
