import { useState } from 'react';
import { authService } from '../services/authService';
import type { RegisterData } from '../types/auth.types';

interface ValidationError {
  field: string;
  message: string;
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const validateForm = (data: RegisterData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push({ field: 'email', message: 'Email inválido' });
    }

    // Validar username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(data.username)) {
      errors.push({
        field: 'username',
        message: 'Username debe tener 3-20 caracteres (solo letras, números y _)',
      });
    }

    // Validar password
    if (data.password.length < 8) {
      errors.push({
        field: 'password',
        message: 'La contraseña debe tener al menos 8 caracteres',
      });
    }

    return errors;
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    setValidationErrors([]);

    // Validar en frontend primero
    const errors = validateForm(data);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return { success: false, error: 'Errores de validación' };
    }

    try {
      const result = await authService.register(data);
      setLoading(false);
      return { success: true, user: result.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return { register, loading, error, validationErrors };
};
