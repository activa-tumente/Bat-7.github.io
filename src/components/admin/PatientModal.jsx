import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser } from 'react-icons/fa';

const PatientModal = ({ 
  isOpen, 
  onClose, 
  patient, 
  onSave, 
  title = "Editar Paciente",
  psychologists = [],
  institutions = []
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    genero: '',
    fecha_nacimiento: '',
    nivel_educativo: '',
    ocupacion: '',
    psicologo_id: '',
    institucion_id: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        nombre: patient.nombre || '',
        apellido: patient.apellido || '',
        email: patient.email || '',
        documento: patient.documento || '',
        genero: patient.genero || '',
        fecha_nacimiento: patient.fecha_nacimiento || '',
        nivel_educativo: patient.nivel_educativo || '',
        ocupacion: patient.ocupacion || '',
        psicologo_id: patient.psicologo_id || '',
        institucion_id: patient.institucion_id || ''
      });
    } else {
      // Reset form for new patient
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        documento: '',
        genero: '',
        fecha_nacimiento: '',
        nivel_educativo: '',
        ocupacion: '',
        psicologo_id: '',
        institucion_id: ''
      });
    }
    setErrors({});
  }, [patient, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    // Solo nombre y apellido son requeridos según la estructura de la tabla
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }
    
    // Validar email solo si se proporciona
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FaUser className="text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.apellido ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el apellido"
              />
              {errors.apellido && (
                <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento
              </label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número de documento"
              />
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Nivel Educativo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel Educativo
              </label>
              <select
                name="nivel_educativo"
                value={formData.nivel_educativo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar nivel educativo</option>
                <option value="primaria">Primaria</option>
                <option value="secundaria">Secundaria</option>
                <option value="tecnico">Técnico</option>
                <option value="universitario">Universitario</option>
                <option value="posgrado">Posgrado</option>
              </select>
            </div>

            {/* Ocupación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ocupación
              </label>
              <input
                type="text"
                name="ocupacion"
                value={formData.ocupacion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ocupación del paciente"
              />
            </div>

            {/* Psicólogo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Psicólogo Asignado
              </label>
              <select
                name="psicologo_id"
                value={formData.psicologo_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar psicólogo</option>
                {psychologists.map((psicologo) => (
                  <option key={psicologo.id} value={psicologo.id}>
                    {psicologo.nombre} {psicologo.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* Institución */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institución
              </label>
              <select
                name="institucion_id"
                value={formData.institucion_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar institución</option>
                {institutions.map((institucion) => (
                  <option key={institucion.id} value={institucion.id}>
                    {institucion.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;