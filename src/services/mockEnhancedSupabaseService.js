/**
 * Servicio mejorado para interactuar con datos mock (sin Supabase)
 * Proporciona funciones para gestionar instituciones, psicólogos y pacientes
 * con manejo de errores, caché y recuperación resiliente
 */

// Datos mock para instituciones
const mockInstituciones = [
  { 
    id: '1', 
    nombre: 'Universidad Nacional', 
    direccion: 'Calle Principal 123', 
    telefono: '123456789',
    tipo: 'Universidad',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '2', 
    nombre: 'Colegio San José', 
    direccion: 'Avenida Central 456', 
    telefono: '987654321',
    tipo: 'Colegio',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Datos mock para psicólogos
const mockPsicologos = [
  { 
    id: '1', 
    nombre: 'Juan', 
    apellido: 'Pérez', 
    genero: 'M',
    email: 'juan.perez@example.com',
    telefono: '123456789',
    institucion_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    instituciones: { id: '1', nombre: 'Universidad Nacional' }
  },
  { 
    id: '2', 
    nombre: 'María', 
    apellido: 'González', 
    genero: 'F',
    email: 'maria.gonzalez@example.com',
    telefono: '987654321',
    institucion_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    instituciones: { id: '2', nombre: 'Colegio San José' }
  }
];

// Datos mock para pacientes
const mockPacientes = [
  { 
    id: '1', 
    nombre: 'Pedro', 
    apellido: 'Sánchez', 
    genero: 'M',
    fecha_nacimiento: '1990-01-01',
    email: 'pedro.sanchez@example.com',
    telefono: '123456789',
    institucion_id: '1',
    psicologo_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    instituciones: { id: '1', nombre: 'Universidad Nacional' },
    psicologos: { id: '1', nombre: 'Juan', apellido: 'Pérez' }
  },
  { 
    id: '2', 
    nombre: 'Ana', 
    apellido: 'Martínez', 
    genero: 'F',
    fecha_nacimiento: '1995-05-15',
    email: 'ana.martinez@example.com',
    telefono: '987654321',
    institucion_id: '2',
    psicologo_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    instituciones: { id: '2', nombre: 'Colegio San José' },
    psicologos: { id: '2', nombre: 'María', apellido: 'González' }
  }
];

class MockEnhancedSupabaseService {
  constructor() {
    this.cache = {
      institutions: { 
        data: [...mockInstituciones], 
        timestamp: new Date() 
      },
      psychologists: { 
        data: [...mockPsicologos], 
        timestamp: new Date() 
      },
      patients: { 
        data: [...mockPacientes], 
        timestamp: new Date() 
      },
    };

    // Tiempo de expiración de caché en minutos
    this.cacheTTL = 5;
  }

  // Métodos auxiliares
  _handleError(error) {
    console.error('Error en servicio mock:', error);
    return {
      message: error.message || 'Error desconocido',
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details || null,
      hint: error.hint || null,
    };
  }

  _isCacheValid(entity) {
    return true; // Siempre válido en mock
  }

  _updateCache(entity, data) {
    this.cache[entity] = {
      data: [...data],
      timestamp: new Date()
    };
  }

  // ========== INSTITUCIONES ==========
  async getInstitutions(sortField = 'nombre', sortOrder = 'asc') {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const sortedData = [...this.cache.institutions.data].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      
      return { data: sortedData, error: null, source: 'cache' };
    } catch (error) {
      return {
        data: this.cache.institutions.data || [],
        error: this._handleError(error),
        source: 'fallback'
      };
    }
  }

  async createInstitution(institutionData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newInstitution = {
        id: Date.now().toString(),
        ...institutionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      this.cache.institutions.data.push(newInstitution);
      
      return { data: newInstitution, error: null };
    } catch (error) {
      return { data: null, error: this._handleError(error) };
    }
  }

  async updateInstitution(id, institutionData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = this.cache.institutions.data.findIndex(i => i.id === id);
      
      if (index !== -1) {
        const updatedInstitution = {
          ...this.cache.institutions.data[index],
          ...institutionData,
          updated_at: new Date().toISOString()
        };
        
        this.cache.institutions.data[index] = updatedInstitution;
        
        return { data: updatedInstitution, error: null };
      } else {
        return { data: null, error: { message: 'Institución no encontrada' } };
      }
    } catch (error) {
      return { data: null, error: this._handleError(error) };
    }
  }

  async deleteInstitution(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = this.cache.institutions.data.findIndex(i => i.id === id);
      
      if (index !== -1) {
        this.cache.institutions.data.splice(index, 1);
        return { error: null };
      } else {
        return { error: { message: 'Institución no encontrada' } };
      }
    } catch (error) {
      return { error: this._handleError(error) };
    }
  }

  // ========== PSICÓLOGOS ==========
  async getPsychologists(sortField = 'nombre', sortOrder = 'asc') {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const sortedData = [...this.cache.psychologists.data].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      
      return { data: sortedData, error: null, source: 'cache' };
    } catch (error) {
      return {
        data: this.cache.psychologists.data || [],
        error: this._handleError(error),
        source: 'fallback'
      };
    }
  }

  // Métodos para simular autenticación
  async getCurrentUser() {
    return { 
      data: {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@example.com',
        role: 'admin',
        is_admin: true
      }, 
      error: null 
    };
  }

  async getUserRole() {
    return { 
      data: {
        role: 'admin',
        is_admin: true
      }, 
      error: null 
    };
  }

  async isAdmin() {
    return { data: true, error: null };
  }
}

// Exportar una instancia única del servicio
const mockEnhancedSupabaseService = new MockEnhancedSupabaseService();

export default mockEnhancedSupabaseService;
