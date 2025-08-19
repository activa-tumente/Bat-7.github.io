import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../api/supabaseClient';
import { toast } from 'react-toastify';
import auditLogger from '../services/auditLogger';

/**
 * Unified Authentication Context
 * Supports multiple authentication modes: development, production, testing
 * Replaces AuthContext, NoAuthContext, and SafeAuthContext
 */
const UnifiedAuthContext = createContext();

// Authentication strategies
class AuthStrategy {
  async initialize() {
    throw new Error('initialize method must be implemented');
  }
  
  async login(credentials) {
    throw new Error('login method must be implemented');
  }
  
  async logout() {
    throw new Error('logout method must be implemented');
  }
}

class DevelopmentAuthStrategy extends AuthStrategy {
  constructor() {
    super();
    this.mockUser = {
      id: 'dev-user',
      email: 'dev@bat7.com',
      nombre: 'Usuario',
      apellido: 'Desarrollo',
      tipo_usuario: 'administrador'
    };
  }

  async initialize() {
    return {
      user: this.mockUser,
      session: { user: this.mockUser },
      loading: false
    };
  }

  async login() {
    return { success: true, user: this.mockUser };
  }

  async logout() {
    return { success: true };
  }

  setUserType(userType) {
    this.mockUser.tipo_usuario = userType;
  }
}

class ProductionAuthStrategy extends AuthStrategy {
  async initialize() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { user: null, session: null, loading: false };
      }

      const profile = await this.fetchUserProfile(session.user.id);
      const user = this.mergeUserWithProfile(session.user, profile);
      
      return { user, session, loading: false };
    } catch (error) {
      console.error('Error initializing auth:', error);
      return { user: null, session: null, loading: false, error };
    }
  }

  async fetchUserProfile(userId) {
    try {
      const { data: profile, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (error) {
        console.warn('No profile found for user:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  mergeUserWithProfile(authUser, profile) {
    return {
      ...authUser,
      ...profile,
      tipo_usuario: profile?.tipo_usuario || 'candidato',
      nombre: profile?.nombre || authUser.user_metadata?.nombre || 'Usuario',
      apellido: profile?.apellido || authUser.user_metadata?.apellido || '',
      email: authUser.email
    };
  }

  async login({ identifier, password }) {
    try {
      const isEmail = identifier.includes('@');
      let loginData;

      if (isEmail) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password
        });
        if (error) throw error;
        loginData = data;
      } else {
        // Login with document - find associated email
        const email = await this.getEmailByDocument(identifier);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        loginData = data;
      }

      const profile = await this.fetchUserProfile(loginData.user.id);
      const user = this.mergeUserWithProfile(loginData.user, profile);
      
      // Update last access
      if (profile) {
        await this.updateLastAccess(profile.id);
      }

      return { success: true, user, session: loginData.session };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  async getEmailByDocument(document) {
    const { data: userProfile, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('documento', document)
      .single();

    if (error || !userProfile) {
      throw new Error('Usuario no encontrado con ese documento');
    }

    const { data: authUser, error: authError } = await supabase.auth.admin
      .getUserById(userProfile.id);
    
    if (authError || !authUser.user) {
      throw new Error('Error al obtener datos de autenticación');
    }

    return authUser.user.email;
  }

  async updateLastAccess(userId) {
    try {
      await supabase
        .from('usuarios')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.warn('Error updating last access:', error);
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }
}

class TestingAuthStrategy extends AuthStrategy {
  constructor() {
    super();
    this.testUser = {
      id: 'test-user',
      email: 'test@bat7.com',
      nombre: 'Test',
      apellido: 'User',
      tipo_usuario: 'candidato'
    };
  }

  async initialize() {
    return {
      user: this.testUser,
      session: { user: this.testUser },
      loading: false
    };
  }

  async login() {
    return { success: true, user: this.testUser };
  }

  async logout() {
    return { success: true };
  }
}

// Strategy factory
const createAuthStrategy = (mode) => {
  switch (mode) {
    case 'development':
      return new DevelopmentAuthStrategy();
    case 'production':
      return new ProductionAuthStrategy();
    case 'testing':
      return new TestingAuthStrategy();
    default:
      return new ProductionAuthStrategy();
  }
};

export const UnifiedAuthProvider = ({ children, mode = 'production' }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStrategy] = useState(() => createAuthStrategy(mode));

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const result = await authStrategy.initialize();
        
        setUser(result.user);
        setSession(result.session);
        setError(result.error || null);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener for production mode
    if (mode === 'production') {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          
          if (session?.user) {
            const profile = await authStrategy.fetchUserProfile(session.user.id);
            const user = authStrategy.mergeUserWithProfile(session.user, profile);
            setUser(user);
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
    }
  }, [authStrategy, mode]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await authStrategy.login(credentials);
      
      if (result.success) {
        setUser(result.user);
        setSession(result.session);
        setError(null);
        
        // Log successful login
        if (mode === 'production') {
          auditLogger.logUserAction(result.user.id, 'login', {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          });
        }
        
        toast.success('Inicio de sesión exitoso');
      } else {
        setError(result.error);
        toast.error(result.error || 'Error al iniciar sesión');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error inesperado al iniciar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const result = await authStrategy.logout();
      
      if (result.success) {
        setUser(null);
        setSession(null);
        setError(null);
        toast.success('Sesión cerrada exitosamente');
      } else {
        toast.error(result.error || 'Error al cerrar sesión');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error inesperado al cerrar sesión';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Helper methods for role checking
  const isAuthenticated = !!user;
  const isAdmin = user?.tipo_usuario === 'administrador';
  const isPsicologo = user?.tipo_usuario === 'psicologo';
  const isCandidato = user?.tipo_usuario === 'candidato';
  
  // Development mode helpers
  const setUserType = (userType) => {
    if (mode === 'development' && authStrategy.setUserType) {
      authStrategy.setUserType(userType);
      setUser(prev => ({ ...prev, tipo_usuario: userType }));
    }
  };

  const value = {
    // Core auth state
    user,
    session,
    loading,
    error,
    
    // Auth actions
    login,
    logout,
    
    // Helper properties
    isAuthenticated,
    userRole: user?.tipo_usuario,
    isAdmin,
    isPsicologo,
    isCandidato,
    
    // Development helpers
    setUserType: mode === 'development' ? setUserType : undefined,
    
    // Mode information
    authMode: mode
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

export default UnifiedAuthContext;