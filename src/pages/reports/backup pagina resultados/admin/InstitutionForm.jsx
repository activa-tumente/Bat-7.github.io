import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

/**
 * Componente de formulario para crear/editar instituciones
 * @param {Object} initialData - Datos iniciales de la institución (para edición)
 * @param {Function} onSubmit - Función a ejecutar al enviar el formulario
 * @param {Function} onCancel - Función a ejecutar al cancelar
 */
const InstitutionForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    sitio_web: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales si se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        direccion: initialData.direccion || '',
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        sitio_web: initialData.sitio_web || '',
        logo_url: initialData.logo_url || ''
      });
    }
  }, [initialData]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.nombre.trim()) {
      alert('El nombre de la institución es obligatorio');
      return false;
    }
    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error en el formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Institución *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sitio Web
          </label>
          <input
            type="url"
            name="sitio_web"
            value={formData.sitio_web}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="https://ejemplo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL del Logo
          </label>
          <input
            type="url"
            name="logo_url"
            value={formData.logo_url}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="https://ejemplo.com/logo.png"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin inline mr-2" />
              Guardando...
            </>
          ) : (
            initialData ? 'Actualizar' : 'Crear'
          )}
        </button>
      </div>
    </form>
  );
};

export default InstitutionForm;