import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaKey, FaSpinner, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import AuthService from '../services/authService';
import { toast } from 'react-toastify';
import supabase from '../api/supabaseClient'; // ✅ Usas la exportación por defecto


/**
 * Página de perfil de usuario
 * Permite visualizar y editar información básica del perfil
 */
const Profile = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Obtener usuario de Auth
        const userData = await AuthService.getCurrentUser();
        setUser(userData);

        if (userData) {
          // Buscar perfil adicional en la base de datos (si existe)
          const { data: profileData, error: profileError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('user_id', userData.id)
            .single();

          if (profileData && !profileError) {
            setUserProfile({
              nombre: profileData.nombre || '',
              apellidos: profileData.apellidos || '',
              telefono: profileData.telefono || '',
            });
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        toast.error('No se pudieron cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Manejar cambios en el formulario de perfil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserProfile({
      ...userProfile,
      [name]: value,
    });
  };

  // Manejar cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Validar formulario de perfil
  const validateProfileForm = () => {
    const newErrors = {};
    
    // Validaciones mínimas
    if (userProfile.nombre && userProfile.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (userProfile.apellidos && userProfile.apellidos.length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar formulario de cambio de contraseña
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar cambios del perfil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setSaving(true);
    try {
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Actualizar o crear perfil
      const { error } = await supabase
        .from('perfiles')
        .upsert({
          user_id: user.id,
          nombre: userProfile.nombre,
          apellidos: userProfile.apellidos,
          telefono: userProfile.telefono,
          updated_at: new Date(),
        });

      if (error) throw error;
      
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      toast.error('Error al guardar los cambios del perfil');
    } finally {
      setSaving(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setSaving(true);
    try {
      // Esta funcionalidad requiere autenticación con la contraseña actual
      // y luego actualizar a la nueva contraseña
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;
      
      // Limpiar formulario de contraseña
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setChangePassword(false);
      toast.success('Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      toast.error('Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
        <span className="ml-2">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="mt-1 text-sm text-gray-600">
          Administra tu información personal y de acceso
        </p>
      </header>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Información principal */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
              {user?.email?.charAt(0).toUpperCase() || <FaUser className="h-8 w-8" />}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">
                {userProfile.nombre ? `${userProfile.nombre} ${userProfile.apellidos}` : 'Usuario'}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="nombre"
                    id="nombre"
                    value={userProfile.nombre}
                    onChange={handleProfileChange}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.nombre ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
                  Apellidos
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="apellidos"
                    id="apellidos"
                    value={userProfile.apellidos}
                    onChange={handleProfileChange}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.apellidos ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.apellidos && (
                    <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    disabled
                    value={user?.email || ''}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-50 rounded-md leading-5 text-gray-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">El email no se puede modificar</p>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="telefono"
                    id="telefono"
                    value={userProfile.telefono}
                    onChange={handleProfileChange}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.telefono ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sección de cambio de contraseña */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Seguridad</h3>
            <button
              type="button"
              onClick={() => setChangePassword(!changePassword)}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {changePassword ? 'Cancelar' : 'Cambiar contraseña'}
            </button>
          </div>

          {changePassword ? (
            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Contraseña actual
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaKey className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nueva contraseña
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaKey className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar nueva contraseña
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaKey className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Advertencia de seguridad */}
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Información importante
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Por seguridad, cierre todas las sesiones activas después de cambiar su contraseña.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar contraseña'
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-600">
              Es recomendable cambiar su contraseña regularmente para mantener la seguridad de su cuenta.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
