/**
 * Diálogo para editar usuarios existentes
 */

import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaEnvelope, FaIdCard, FaBuilding } from 'react-icons/fa';
import supabase from '../../api/supabaseClient';

const EditUserDialog = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    documento: user?.documento || '',
    tipo_usuario: user?.tipo_usuario || 'Candidato',
    institucion_id: user?.institucion_id || '',
    activo: user?.activo !== false
  });
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar instituciones
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const { data, error } = await supabase
          .from('instituciones')
          .select('id, nombre')
          .eq('activo', true)
          .order('nombre');

        if (error) throw error;
        setInstitutions(data || []);
      } catch (error) {
        console.error('Error al cargar instituciones:', error);
      }
    };

    fetchInstitutions();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.documento.trim()) {
      newErrors.documento = 'El documento es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await onSubmit({
        ...formData,
        updated_by: 'current_admin_id' // TODO: Obtener ID del admin actual
      });

      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FaEdit className="mr-2 h-5 w-5 text-amber-600" />
              Editar Usuario
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Información del usuario */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-medium">
                {user.nombre?.charAt(0)?.toUpperCase()}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {user.nombre} {user.apellido}
                </div>
                <div className="text-sm text-gray-500">
                  {user.email} • {user.documento}
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.nombre ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.apellido ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese el apellido"
              />
              {errors.apellido && (
                <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
              )}
            </div>

            {/* Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento de Identidad *
              </label>
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => handleChange('documento', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.documento ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese el documento"
              />
              {errors.documento && (
                <p className="mt-1 text-sm text-red-600">{errors.documento}</p>
              )}
            </div>

            {/* Tipo de Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Usuario *
              </label>
              <select
                value={formData.tipo_usuario}
                onChange={(e) => handleChange('tipo_usuario', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Candidato">Candidato</option>
                <option value="Psicólogo">Psicólogo</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            {/* Institución */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institución
              </label>
              <select
                value={formData.institucion_id}
                onChange={(e) => handleChange('institucion_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Seleccionar institución</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado Activo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => handleChange('activo', e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                Usuario activo
              </label>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Nota:</strong> El email no se puede modificar desde aquí. 
                Para cambios de email, contacte al administrador del sistema.
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserDialog;
