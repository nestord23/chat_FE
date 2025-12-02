import { useState, useEffect, useRef } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
}

interface SearchResult {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  cached?: boolean;
}

export function useUserSearch(debouncedQuery: string) {
  const [Loading, setLoading] = useState(false);
  const [result, setResults] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        setError(null);
        return;
      }
      //validacion
      if (debouncedQuery.length > 50) {
        setError('maximo de carateres 50');
        return;
      }
      const allowedPattern = /^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑüÜ]+$/;
      if (!allowedPattern.test(debouncedQuery)) {
        setError('carateres no permitidos');
        return;
      }
      //cancelar busqueda anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:3001/api/users/search?q=${encodeURIComponent(debouncedQuery)}&page=1&limit=10`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          switch (response.status) {
            case 400:
              throw new Error(errorData.message || 'Búsqueda inválida');
            case 401:
              throw new Error('Debes iniciar sesión');
            case 429:
              throw new Error('Demasiadas búsquedas. Espera un momento.');
            case 500:
              throw new Error('Error del servidor');
            default:
              throw new Error('Error desconocido');
          }
        }
        const data: SearchResult = await response.json();

        if (data.success) {
          setResults(data.data);
        } else {
          throw new Error('Error en la búsqueda');
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            return;
          }
          setError(err.message || 'Error en la búsqueda');
        } else {
          setError('Error al buscar usuarios');
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  return { Loading, result, error };
}
