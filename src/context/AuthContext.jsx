import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../api/supabaseClient';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import auditLogger from '../services/auditLogger';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('usuarios')
              .select('*')
              .eq('auth_id', session.user.id)
              .single();

            if (profileError) {
              console.warn('No se encontró perfil de usuario:', profileError);
              // Usuario autenticado pero sin perfil en la BD
              setUser({
                ...session.user,
                tipo_usuario: 'candidato', // Rol por defecto
                nombre: session.user.user_metadata?.nombre || 'Usuario',
                apellido: session.user.user_metadata?.apellido || '',
                email: session.user.email
              });
            } else {
              // Usuario con perfil completo
              const userWithMappedRole = {
                ...session.user,
                ...profile,
                tipo_usuario: profile.tipo_usuario || 'candidato'
              };
              setUser(userWithMappedRole);
            }
          } catch (profileError) {
            console.error('Error al obtener perfil:', profileError);
            // Fallback: usuario básico
            setUser({
              ...session.user,
              tipo_usuario: 'candidato',
              nombre: session.user.user_metadata?.nombre || 'Usuario',
              apellido: session.user.user_metadata?.apellido || '',
              email: session.user.email
            });
          }
        }
      } catch (error) {
        console.error('Error al obtener sesión y perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        if (currentUser) {
          try {
            const { data: profile } = await supabase
              .from('usuarios')
              .select('*')
              .eq('id', currentUser.id)
              .single();

            // Mapear rol a tipo_usuario para consistencia en toda la aplicación
            const userWithMappedRole = {
              ...currentUser,
              ...profile,
              tipo_usuario: profile.tipo_usuario || 'candidato' // Usar tipo_usuario directamente
            };
            setUser(userWithMappedRole);
          } catch (error) {
            console.error('Error al obtener perfil de usuario:', error);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Login function - soporta email o documento
  const login = async ({ email, identifier, password }, remember = false) => {
    try {
      setLoading(true);

      let loginEmail = email || identifier;

      // Si el identifier no es un email, buscar el email por documento usando RPC segura
      if (identifier && !identifier.includes('@')) {
        const { data: emailFromDoc, error: rpcError } = await supabase.rpc(
          'get_email_by_documento',
          { p_documento: identifier }
        );

        if (rpcError || !emailFromDoc) {
          throw new Error('Usuario no encontrado con ese documento');
        }

        loginEmail = emailFromDoc;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      });

      if (error) throw error;

      // Obtener perfil del usuario
      const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Mapear rol a tipo_usuario para consistencia en toda la aplicación
      const userWithProfile = {
        ...data.user,
        ...profile,
        tipo_usuario: profile.rol // Mapear rol de BD a tipo_usuario esperado por la app
      };
      setUser(userWithProfile);

      // Actualizar último acceso
      await supabase
        .from('usuarios')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', data.user.id);

      toast.success('Inicio de sesión exitoso');

      // Log de auditoría para login exitoso
      auditLogger.logLogin(true, loginEmail, userWithProfile.tipo_usuario, {
        loginMethod: identifier && !identifier.includes('@') ? 'documento' : 'email',
        userId: userWithProfile.id
      });

      return {
        success: true,
        user: userWithProfile
      };
    } catch (error) {
      console.error('Error de inicio de sesión:', error.message);
      toast.error(error.message || 'Error al iniciar sesión');

      // Log de auditoría para login fallido
      auditLogger.logLogin(false, loginEmail || identifier, null, {
        errorMessage: error.message,
        loginMethod: identifier && !identifier.includes('@') ? 'documento' : 'email'
      });

      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async ({ email, password, ...userData }) => {
    try {
      setLoading(true);
      
      // Registrar usuario en Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      // Crear perfil en la tabla usuarios
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: data.user.id,
            documento: userData.documento,
            nombre: userData.nombre,
            apellido: userData.apellido,
            tipo_usuario: userData.tipo_usuario || 'Candidato',
            activo: true,
            fecha_creacion: new Date().toISOString()
          }
        ]);

      if (profileError) throw profileError;

      toast.success('Registro exitoso');
      
      return {
        success: true,
        user: data.user,
        message: 'Registro exitoso'
      };
    } catch (error) {
      console.error('Error de registro:', error.message);
      toast.error(error.message || 'Error al registrar usuario');
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Log de auditoría antes de limpiar el usuario
      auditLogger.info('logout', 'Usuario cerró sesión', {
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.tipo_usuario
      });

      setUser(null);
      setSession(null);

      toast.info('Sesión cerrada correctamente');

      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
      toast.error(error.message || 'Error al cerrar sesión');
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast.success('Se ha enviado un enlace para restablecer la contraseña');
      
      return { success: true };
    } catch (error) {
      console.error('Error al restablecer contraseña:', error.message);
      toast.error(error.message || 'Error al restablecer contraseña');
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Update password function
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Contraseña actualizada correctamente');
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar contraseña:', error.message);
      toast.error(error.message || 'Error al actualizar contraseña');
      return {
        success: false,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Determinar roles y permisos (esquema robusto)
  const userRole = user?.tipo_usuario?.toLowerCase() || '';
  const isAdmin = userRole === 'administrador';
  const isPsychologist = userRole === 'psicólogo';
  const isCandidate = userRole === 'candidato';

  // Mantener compatibilidad con el esquema anterior
  const isStudent = isCandidate;

  const value = {
    // Authentication state
    user,
    session,
    loading,
    isAuthenticated: !!user,

    // Authentication functions
    login,
    register,
    logout,
    resetPassword,
    updatePassword,

    // Roles and permissions
    isAdmin,
    isPsychologist,
    isCandidate,
    isStudent, // Mantener compatibilidad
    userRole,

    // User properties
    userId: user?.id,
    userEmail: user?.email,
    userDocumento: user?.documento,
    userName: user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : '',
    userFirstName: user?.nombre,
    userLastName: user?.apellido,

    // Session info
    sessionCreated: user?.fecha_creacion,
    lastAccess: user?.ultimo_acceso
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
