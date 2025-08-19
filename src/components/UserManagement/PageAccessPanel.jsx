/**
 * Panel de control de acceso a páginas y permisos
 */

import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaShieldAlt, FaRoute, FaKey } from 'react-icons/fa';
import { useRoutePermissions } from '../../hooks/useRoutePermissions';
import DataTable from '../ui/DataTable';

const PageAccessPanel = () => {
  const {
    routePermissions,
    rolePermissions,
    loading,
    error,
    createRoutePermission,
    updateRoutePermission,
    deleteRoutePermission,
    createRolePermission,
    updateRolePermission,
    deleteRolePermission,
    applicationRoutes,
    availableRoles,
    availablePermissions,
    availableResources
  } = useRoutePermissions();

  const [activeSection, setActiveSection] = useState('routes');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Configuración de columnas para permisos de rutas
  const routeColumns = [
    {
      key: 'route_path',
      label: 'Ruta',
      sortable: true,
      render: (item) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
          {item.route_path}
        </code>
      )
    },
    {
      key: 'required_role',
      label: 'Rol Requerido',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.required_role === 'Administrador' 
            ? 'bg-red-100 text-red-800'
            : item.required_role === 'Psicólogo'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {item.required_role}
        </span>
      )
    },
    {
      key: 'required_permission',
      label: 'Permiso',
      render: (item) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
          {item.required_permission}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (item) => item.description || 'Sin descripción'
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.is_active 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {item.is_active ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  // Configuración de columnas para permisos de roles
  const roleColumns = [
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.role === 'Administrador' 
            ? 'bg-red-100 text-red-800'
            : item.role === 'Psicólogo'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {item.role}
        </span>
      )
    },
    {
      key: 'permission',
      label: 'Permiso',
      render: (item) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">
          {item.permission}
        </span>
      )
    },
    {
      key: 'resource',
      label: 'Recurso',
      render: (item) => item.resource || 'General'
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (item) => item.description || 'Sin descripción'
    }
  ];

  const handleCreateNew = () => {
    setEditingItem(null);
    setFormData({});
    setShowCreateDialog(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowCreateDialog(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm('¿Está seguro de que desea eliminar este elemento?')) {
      if (activeSection === 'routes') {
        await deleteRoutePermission(item.id);
      } else {
        await deleteRolePermission(item.id);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (activeSection === 'routes') {
        if (editingItem) {
          await updateRoutePermission(editingItem.id, formData);
        } else {
          await createRoutePermission(formData);
        }
      } else {
        if (editingItem) {
          await updateRolePermission(editingItem.id, formData);
        } else {
          await createRolePermission(formData);
        }
      }
      
      setShowCreateDialog(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const renderForm = () => {
    if (activeSection === 'routes') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ruta
            </label>
            <select
              value={formData.route_path || ''}
              onChange={(e) => setFormData({ ...formData, route_path: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Seleccionar ruta</option>
              {applicationRoutes.map((route) => (
                <option key={route.path} value={route.path}>
                  {route.path} - {route.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol Requerido
            </label>
            <select
              value={formData.required_role || ''}
              onChange={(e) => setFormData({ ...formData, required_role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Seleccionar rol</option>
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permiso
            </label>
            <select
              value={formData.required_permission || ''}
              onChange={(e) => setFormData({ ...formData, required_permission: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Seleccionar permiso</option>
              {availablePermissions.map((permission) => (
                <option key={permission.value} value={permission.value}>
                  {permission.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active !== false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Activo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700"
            >
              {editingItem ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      );
    } else {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Seleccionar rol</option>
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permiso
            </label>
            <select
              value={formData.permission || ''}
              onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Seleccionar permiso</option>
              {availablePermissions.map((permission) => (
                <option key={permission.value} value={permission.value}>
                  {permission.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurso
            </label>
            <select
              value={formData.resource || ''}
              onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Seleccionar recurso</option>
              {availableResources.map((resource) => (
                <option key={resource.value} value={resource.value}>
                  {resource.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700"
            >
              {editingItem ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Control de Acceso</h2>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona permisos de rutas y roles del sistema
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Nuevo {activeSection === 'routes' ? 'Permiso de Ruta' : 'Permiso de Rol'}
          </button>
        </div>

        {/* Selector de sección */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveSection('routes')}
                className={`${
                  activeSection === 'routes'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center py-2 px-1 border-b-2 font-medium text-sm`}
              >
                <FaRoute className="mr-2 h-4 w-4" />
                Permisos de Rutas
              </button>
              <button
                onClick={() => setActiveSection('roles')}
                className={`${
                  activeSection === 'roles'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center py-2 px-1 border-b-2 font-medium text-sm`}
              >
                <FaKey className="mr-2 h-4 w-4" />
                Permisos de Roles
              </button>
            </nav>
          </div>
        </div>

        {/* Tabla */}
        <DataTable
          columns={activeSection === 'routes' ? routeColumns : roleColumns}
          data={activeSection === 'routes' ? routePermissions : rolePermissions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={`No hay ${activeSection === 'routes' ? 'permisos de rutas' : 'permisos de roles'} configurados`}
        />
      </div>

      {/* Modal de creación/edición */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingItem ? 'Editar' : 'Crear'} {activeSection === 'routes' ? 'Permiso de Ruta' : 'Permiso de Rol'}
                </h3>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              {renderForm()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageAccessPanel;
