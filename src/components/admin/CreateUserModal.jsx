import React, { useState } from 'react';
import { FaTimes, FaSave, FaUser, FaEnvelope, FaIdCard, FaUserTag } from 'react-icons/fa';

const CreateUserModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    tipo_usuario: 'candidato'
  });
  const [errors, setErrors] = useState({});

  const roles = [
    { value: 'administrador', label: 'Administrador' },
    { value: 'psicologo', label: 'Psicólogo' },
    { value: 'candidato', label: 'Candidato' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar documento
    if (!formData.documento.trim()) {
      newErrors.documento = 'El documento es requerido';
    } else if (formData.documento.trim().length < 6) {
      newErrors.documento = 'El documento debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email.trim(),
      documento: formData.documento.trim(),
      tipo_usuario: formData.tipo_usuario
    };

    const result = await onSubmit(userData);

    if (result?.success) {
      // Limpiar formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        documento: '',
        tipo_usuario: 'candidato'
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      documento: '',
      tipo_usuario: 'candidato'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaUser className="mr-2 text-blue-600" />
            Crear Nuevo Usuario
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el nombre"
              />
            </div>
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.apellido ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el apellido"
              />
            </div>
            {errors.apellido && (
              <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="correo@ejemplo.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento *
            </label>
            <div className="relative">
              <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.documento ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Número de documento"
              />
            </div>
            {errors.documento && (
              <p className="text-red-500 text-xs mt-1">{errors.documento}</p>
            )}
          </div>

          {/* Tipo de Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Usuario *
            </label>
            <div className="relative">
              <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="tipo_usuario"
                value={formData.tipo_usuario}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>



          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <FaSave />
                  <span>Crear Usuario</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <FaTimes />
              <span>Cancelar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
