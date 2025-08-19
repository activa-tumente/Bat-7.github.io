/**
 * Panel principal de gestión de usuarios
 * Componente mejorado con funcionalidades avanzadas
 */

import React, { useState } from 'react';
import { FaUserPlus, FaSearch, FaFilter, FaDownload, FaUsers, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { useUserManagement } from '../../hooks/useUserManagement';
import DataTable from '../ui/DataTable';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import UserFilters from './UserFilters';
import UserStatistics from './UserStatistics';

const UserManagementPanel = () => {
  const {
    users,
    loading,
    error,
    filters,
    totalCount,
    statistics,
    updateFilters,
    resetFilters,
    changePage,
    changeSort,
    createUser,
    updateUser,
    deleteUser,
    totalPages,
    hasNextPage,
    hasPrevPage
  } = useUserManagement();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Configuración de columnas para la tabla
  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-medium">
              {user.nombre?.charAt(0)?.toUpperCase()}
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {user.nombre} {user.apellido}
            </div>
            <div className="text-sm text-gray-500">{user.documento}</div>
          </div>
        </div>
      )
    },
    {
      key: 'tipo_usuario',
      label: 'Tipo',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.tipo_usuario === 'Administrador' 
            ? 'bg-red-100 text-red-800'
            : user.tipo_usuario === 'Psicólogo'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {user.tipo_usuario}
        </span>
      )
    },
    {
      key: 'institucion',
      label: 'Institución',
      render: (user) => user.institucion?.nombre || 'Sin asignar'
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.activo 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {user.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'fecha_creacion',
      label: 'Fecha Creación',
      sortable: true,
      render: (user) => new Date(user.fecha_creacion).toLocaleDateString()
    },
    {
      key: 'ultimo_acceso',
      label: 'Último Acceso',
      sortable: true,
      render: (user) => user.ultimo_acceso 
        ? new Date(user.ultimo_acceso).toLocaleDateString()
        : 'Nunca'
    }
  ];

  const handleCreateUser = async (userData) => {
    const result = await createUser(userData);
    if (result.success) {
      setShowCreateDialog(false);
    }
    return result;
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleUpdateUser = async (userData) => {
    const result = await updateUser(selectedUser.id, userData);
    if (result.success) {
      setShowEditDialog(false);
      setSelectedUser(null);
    }
    return result;
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      await deleteUser(userId, 'current_admin_id'); // TODO: Obtener ID del admin actual
    }
  };

  const handleExportUsers = () => {
    const csvData = users.map(user => ({
      nombre: user.nombre,
      apellido: user.apellido,
      documento: user.documento,
      tipo_usuario: user.tipo_usuario,
      institucion: user.institucion?.nombre || '',
      activo: user.activo ? 'Sí' : 'No',
      fecha_creacion: new Date(user.fecha_creacion).toLocaleDateString()
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'usuarios.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <UserStatistics statistics={statistics} />

      {/* Encabezado y controles */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Gestión de Usuarios</h2>
            <p className="mt-1 text-sm text-gray-500">
              Administra usuarios del sistema, roles y permisos
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <FaFilter className="mr-2 h-4 w-4" />
              Filtros
            </button>
            <button
              onClick={handleExportUsers}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <FaDownload className="mr-2 h-4 w-4" />
              Exportar
            </button>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <FaUserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <UserFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onResetFilters={resetFilters}
          />
        )}

        {/* Barra de búsqueda */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar usuarios por nombre, documento..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Tabla de usuarios */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSort={changeSort}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          emptyMessage="No se encontraron usuarios"
          itemsPerPage={filters.pageSize}
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((filters.page - 1) * filters.pageSize) + 1} a{' '}
              {Math.min(filters.page * filters.pageSize, totalCount)} de {totalCount} usuarios
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => changePage(filters.page - 1)}
                disabled={!hasPrevPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-sm font-medium text-gray-700">
                Página {filters.page} de {totalPages}
              </span>
              <button
                onClick={() => changePage(filters.page + 1)}
                disabled={!hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Diálogos */}
      {showCreateDialog && (
        <CreateUserDialog
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {showEditDialog && selectedUser && (
        <EditUserDialog
          user={selectedUser}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default UserManagementPanel;
