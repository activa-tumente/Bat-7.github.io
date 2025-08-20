import React, { useState } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaUsers, FaUserCheck, FaUserTimes } from 'react-icons/fa';

const SimpleUserManagementPanel = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@test.com',
      documento: '12345678',
      tipo_usuario: 'candidato',
      activo: true,
      fecha_creacion: '2025-07-15'
    },
    {
      id: 2,
      nombre: 'María',
      apellido: 'García',
      email: 'maria.garcia@test.com',
      documento: '87654321',
      tipo_usuario: 'psicologo',
      activo: true,
      fecha_creacion: '2025-07-14'
    },
    {
      id: 3,
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@bat7.com',
      documento: '11111111',
      tipo_usuario: 'administrador',
      activo: true,
      fecha_creacion: '2025-07-10'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Funciones para manejar usuarios
  const handleCreateUser = (userData) => {
    const newUser = {
      id: Math.max(...users.map(u => u.id)) + 1,
      ...userData,
      fecha_creacion: new Date().toISOString().split('T')[0],
      activo: true
    };
    setUsers([...users, newUser]);
    setShowCreateModal(false);
  };

  const handleEditUser = (userData) => {
    setUsers(users.map(user =>
      user.id === editingUser.id ? { ...user, ...userData } : user
    ));
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.documento?.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.tipo_usuario === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(user => user.activo === true).length,
    inactive: users.filter(user => user.activo === false).length
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'administrador':
        return 'bg-red-100 text-red-800';
      case 'psicologo':
        return 'bg-blue-100 text-blue-800';
      case 'candidato':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    return status === true || status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <p className="text-gray-600 mt-2">Administra usuarios del sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-gray-600">Total Usuarios</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FaUserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-gray-600">Usuarios Activos</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <FaUserTimes className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              <p className="text-gray-600">Usuarios Inactivos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los roles</option>
            <option value="administrador">Administrador</option>
            <option value="psicologo">Psicólogo</option>
            <option value="candidato">Candidato</option>
          </select>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            onClick={() => setShowCreateModal(true)}
          >
            <FaUserPlus />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* Tabla de usuarios */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Usuario</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Documento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Rol</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user.id}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-gray-600">{user.documento}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.tipo_usuario)}`}>
                      {user.tipo_usuario}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.activo)}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        onClick={() => openEditModal(user)}
                        title="Editar usuario"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Eliminar usuario"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron usuarios que coincidan con los criterios de búsqueda.
          </div>
        )}
      </div>

      {/* Modal para crear usuario */}
      {showCreateModal && (
        <UserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateUser}
          title="Crear Nuevo Usuario"
        />
      )}

      {/* Modal para editar usuario */}
      {showEditModal && (
        <UserModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditUser}
          title="Editar Usuario"
          initialData={editingUser}
        />
      )}
    </div>
  );
};

// Componente Modal para crear/editar usuarios
const UserModal = ({ isOpen, onClose, onSave, title, initialData = null }) => {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    apellido: initialData?.apellido || '',
    email: initialData?.email || '',
    documento: initialData?.documento || '',
    tipo_usuario: initialData?.tipo_usuario || 'candidato'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nombre && formData.apellido && formData.email && formData.documento) {
      onSave(formData);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        documento: '',
        tipo_usuario: 'candidato'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido
            </label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento
            </label>
            <input
              type="text"
              value={formData.documento}
              onChange={(e) => setFormData({...formData, documento: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Usuario
            </label>
            <select
              value={formData.tipo_usuario}
              onChange={(e) => setFormData({...formData, tipo_usuario: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="candidato">Candidato</option>
              <option value="psicologo">Psicólogo</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleUserManagementPanel;
