import { useToast as useToastFromContext } from '../context/ToastContext';

// Re-exportamos el hook desde el contexto
export const useToast = useToastFromContext;