import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaUserShield } from 'react-icons/fa';
import supabase from '../../api/supabaseClient';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    documento: '',
    rol: 'estudiante'
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para obtener usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Obtener usuarios de auth.users (requiere permisos de administrador)
      const { data: authUsers, error: authError } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (authError) throw authError;

      setUsers(authUsers || []);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      toast.error('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios según término de búsqueda
  const filteredUsers = users.filter(user => {
    const searchString = searchTerm.toLowerCase();
    return (
      (user.nombre && user.nombre.toLowerCase().includes(searchString)) ||
      (user.apellido && user.apellido.toLowerCase().includes(searchString)) ||
      (user.documento && user.documento.toLowerCase().includes(searchString)) ||
      (user.email && user.email.toLowerCase().includes(searchString)) ||
      (user.rol && user.rol.toLowerCase().includes(searchString))
    );
  });

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Abrir modal para crear nuevo usuario
  const handleNewUser = () => {
    setCurrentUser(null);
    setFormData({
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      documento: '',
      rol: 'estudiante'
    });
    setShowModal(true);
  };

  // Abrir modal para editar usuario existente
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      email: user.email || '',
      password: '', // No mostrar contraseña actual
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      documento: user.documento || '',
      rol: user.rol || 'estudiante'
    });
    setShowModal(true);
  };

  // Crear o actualizar usuario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (currentUser) {
        // Actualizar usuario existente
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({
            nombre: formData.nombre,
            apellido: formData.apellido,
            documento: formData.documento,
            rol: formData.rol
          })
          .eq('id', currentUser.id);

        if (updateError) throw updateError;

        // Si se proporcionó una nueva contraseña, actualizarla
        if (formData.password) {
          // Esta operación requiere permisos especiales o una función RPC
          const { error: passwordError } = await supabase.rpc('change_user_password', {
            user_id: currentUser.id,
            new_password: formData.password
          });

          if (passwordError) {
            console.warn('No se pudo actualizar la contraseña:', passwordError);
            toast.warning('Usuario actualizado, pero no se pudo cambiar la contraseña');
          }
        }

        toast.success('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            documento: formData.documento,
            role: formData.rol
          }
        });

        if (authError) {
          // Si falla la creación directa, intentar con signUp normal
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                nombre: formData.nombre,
                apellido: formData.apellido,
                documento: formData.documento,
                role: formData.rol
              }
            }
          });

          if (signUpError) throw signUpError;

          // Crear entrada en la tabla usuarios
          const { error: profileError } = await supabase
            .from('usuarios')
            .insert([{
              id: signUpData.user.id,
              nombre: formData.nombre,
              apellido: formData.apellido,
              documento: formData.documento,
              rol: formData.rol
            }]);

          if (profileError) throw profileError;
        } else {
          // Crear entrada en la tabla usuarios
          const { error: profileError } = await supabase
            .from('usuarios')
            .insert([{
              id: authData.user.id,
              nombre: formData.nombre,
              apellido: formData.apellido,
              documento: formData.documento,
              rol: formData.rol
            }]);

          if (profileError) throw profileError;
        }

        toast.success('Usuario creado correctamente');
      }

      // Recargar lista de usuarios
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      toast.error('Error al guardar usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);

      // Eliminar usuario de auth.users (requiere permisos de administrador)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        // Si falla la eliminación directa, intentar con una función RPC
        const { error: rpcError } = await supabase.rpc('delete_user', {
          user_id: userId
        });

        if (rpcError) throw rpcError;
      }

      toast.success('Usuario eliminado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gestión de Usuarios</h2>
        <button
          onClick={handleNewUser}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
        >
          <FaUserPlus className="mr-2" /> Nuevo Usuario
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.nombre} {user.apellido}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.documento || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.rol === 'administrador' ? 'bg-purple-100 text-purple-800' :
                        user.rol === 'psicologo' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {user.rol || 'estudiante'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <FaEdit className="inline" /> Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash className="inline" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FaUserShield className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {currentUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                              Nombre
                            </label>
                            <input
                              type="text"
                              name="nombre"
                              id="nombre"
                              value={formData.nombre}
                              onChange={handleChange}
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                              Apellido
                            </label>
                            <input
                              type="text"
                              name="apellido"
                              id="apellido"
                              value={formData.apellido}
                              onChange={handleChange}
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="documento" className="block text-sm font-medium text-gray-700">
                            Documento de Identidad
                          </label>
                          <input
                            type="text"
                            name="documento"
                            id="documento"
                            value={formData.documento}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>

                        {!currentUser && (
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Correo Electrónico
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        )}

                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            {currentUser ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required={!currentUser}
                          />
                        </div>

                        <div>
                          <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                            Rol
                          </label>
                          <select
                            name="rol"
                            id="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          >
                            <option value="estudiante">Estudiante</option>
                            <option value="psicologo">Psicólogo</option>
                            <option value="administrador">Administrador</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : currentUser ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
