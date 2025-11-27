import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatMessageTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: es,
  });
};

export const formatFullDate = (date: string | Date): string => {
  return format(new Date(date), 'PPpp', { locale: es });
};

export const formatTime = (date: string | Date): string => {
  return format(new Date(date), 'HH:mm');
};
