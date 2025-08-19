import React, { useState } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaUsers, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { useUserManagement } from '../../hooks/useUserManagement';
import CreateUserModal from './CreateUserModal';

const UserManagementPanel = () => {
  const {
    users,
    stats,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
  } = useUserManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  console.log('UserManagementPanel: Renderizando con', users.length, 'usuarios');

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      setShowCreateModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await updateUser(userId, updates);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      await deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId, currentStatus);
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.documento?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'administrador':
        return 'bg-red-100 text-red-800';
      case 'psicologo':
        return 'bg-blue-100 text-blue-800';
      case 'estudiante':
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <p className="text-gray-600 mt-2">Administra usuarios del sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FaUsers className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <FaUserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Inactivos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
            <FaUserTimes className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">Todos los roles</option>
                <option value="administrador">Administrador</option>
                <option value="psicologo">Psicólogo</option>
                <option value="estudiante">Estudiante</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaUserPlus />
            <span>Crear Usuario</span>
          </button>
        </div>

        {/* Tabla de usuarios */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.nombre} {user.apellido}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.documento}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.rol)}`}>
                      {user.rol || 'Sin rol'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.activo)}`}>
                      {user.activo === true ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.fecha_creacion ? new Date(user.fecha_creacion).toLocaleDateString('es-ES') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* Modal de crear usuario */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        loading={false}
      />
    </div>
  );
};

export default UserManagementPanel;
