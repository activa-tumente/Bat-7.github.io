import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaSave, FaSpinner } from 'react-icons/fa';

/**
 * Modal component for creating/editing candidates
 */
const CandidateModal = ({ 
  isOpen, 
  onClose, 
  candidate, 
  onSave, 
  institutions, 
  psychologists, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    documento_identidad: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    estado: 'activo',
    institucion_id: '',
    psicologo_id: '',
    notas: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (candidate) {
      setFormData({
        nombre: candidate.nombre || '',
        apellidos: candidate.apellidos || '',
        documento_identidad: candidate.documento_identidad || '',
        email: candidate.email || '',
        telefono: candidate.telefono || '',
        fecha_nacimiento: candidate.fecha_nacimiento || '',
        genero: candidate.genero || '',
        estado: candidate.estado || 'activo',
        institucion_id: candidate.institucion_id || '',
        psicologo_id: candidate.psicologo_id || '',
        notas: candidate.notas || ''
      });
    } else {
      setFormData({
        nombre: '',
        apellidos: '',
        documento_identidad: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        genero: '',
        estado: 'activo',
        institucion_id: '',
        psicologo_id: '',
        notas: ''
      });
    }
    setErrors({});
  }, [candidate, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    if (!formData.documento_identidad.trim()) {
      newErrors.documento_identidad = 'El documento de identidad es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    }

    if (!formData.genero) {
      newErrors.genero = 'El género es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
              <FaUser className="text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {candidate ? 'Editar Candidato' : 'Nuevo Candidato'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Información Personal
              </h4>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>

            {/* Last Names */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                  errors.apellidos ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese los apellidos"
              />
              {errors.apellidos && (
                <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
              )}
            </div>

            {/* Document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documento de Identidad *
              </label>
              <input
                type="text"
                name="documento_identidad"
                value={formData.documento_identidad}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                  errors.documento_identidad ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el documento"
              />
              {errors.documento_identidad && (
                <p className="mt-1 text-sm text-red-600">{errors.documento_identidad}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ingrese el teléfono"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                  errors.fecha_nacimiento ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fecha_nacimiento && (
                <p className="mt-1 text-sm text-red-600">{errors.fecha_nacimiento}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género *
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                  errors.genero ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione el género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
              {errors.genero && (
                <p className="mt-1 text-sm text-red-600">{errors.genero}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institución
              </label>
              <select
                name="institucion_id"
                value={formData.institucion_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Seleccione una institución</option>
                {institutions?.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Psychologist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Psicólogo Asignado
              </label>
              <select
                name="psicologo_id"
                value={formData.psicologo_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Seleccione un psicólogo</option>
                {psychologists?.map(psychologist => (
                  <option key={psychologist.id} value={psychologist.id}>
                    {psychologist.nombre} {psychologist.apellidos}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Notas adicionales sobre el candidato..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {candidate ? 'Actualizar' : 'Crear'} Candidato
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateModal;
