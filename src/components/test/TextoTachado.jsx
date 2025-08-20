import React from 'react';

/**
 * Componente para mostrar texto tachado en rojo
 * Usado para representar datos borrados en las tablas del test numérico
 */
export default function TextoTachado({ children = "dato borrado" }) {
  return (
    <span className="line-through text-red-600 font-medium">
      {children}
    </span>
  );
}
