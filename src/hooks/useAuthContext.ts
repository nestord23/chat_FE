import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  }
  return context;
};
