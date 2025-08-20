import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://ydglduxhgwajqdseqzpy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZ2xkdXhoZ3dhanFkc2VxenB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjMxMjg0MSwiZXhwIjoyMDYxODg4ODQxfQ.zwk3Wiay5jjeYOrg8B1M6T98B2esCqRFI43At-AFV3A';

// Crear cliente con service role key para operaciones administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verifica si la tabla test_sessions existe
 */
async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .from('test_sessions')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST106') {
      return false; // Tabla no existe
    }
    
    return true; // Tabla existe
  } catch (error) {
    console.error('Error verificando tabla:', error);
    return false;
  }
}

/**
 * Crea la tabla test_sessions
 */
async function createTestSessionsTable() {
  const createTableSQL = `
    -- Crear la tabla test_sessions
    CREATE TABLE IF NOT EXISTS public.test_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        paciente_id UUID NOT NULL,
        test_id VARCHAR(50) NOT NULL,
        usuario_id UUID,
        aptitud_id UUID,
        fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fecha_fin TIMESTAMPTZ,
        estado VARCHAR(20) NOT NULL DEFAULT 'iniciado' CHECK (estado IN ('iniciado', 'finalizado', 'cancelado')),
        ip_address INET,
        user_agent TEXT,
        resultados JSONB,
        pin_consumed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Crear índices
    CREATE INDEX IF NOT EXISTS idx_test_sessions_paciente_id ON public.test_sessions(paciente_id);
    CREATE INDEX IF NOT EXISTS idx_test_sessions_estado ON public.test_sessions(estado);
    CREATE INDEX IF NOT EXISTS idx_test_sessions_fecha_inicio ON public.test_sessions(fecha_inicio);

    -- Habilitar RLS
    ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

    -- Crear políticas de seguridad
    DROP POLICY IF EXISTS "Users can view test sessions" ON public.test_sessions;
    CREATE POLICY "Users can view test sessions" ON public.test_sessions
        FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Users can insert test sessions" ON public.test_sessions;
    CREATE POLICY "Users can insert test sessions" ON public.test_sessions
        FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Users can update test sessions" ON public.test_sessions;
    CREATE POLICY "Users can update test sessions" ON public.test_sessions
        FOR UPDATE USING (true);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('❌ Error creando tabla test_sessions:', error);
      return false;
    }
    
    console.log('✅ Tabla test_sessions creada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error ejecutando SQL:', error);
    return false;
  }
}

/**
 * Función principal para configurar la tabla
 */
async function setupTestSessionsTable() {
  console.log('🔍 Verificando si existe la tabla test_sessions...');
  
  const tableExists = await checkTableExists();
  
  if (tableExists) {
    console.log('✅ La tabla test_sessions ya existe');
    return true;
  }
  
  console.log('⚠️ La tabla test_sessions no existe, creándola...');
  
  const created = await createTestSessionsTable();
  
  if (created) {
    console.log('🎉 Configuración de test_sessions completada');
    return true;
  } else {
    console.log('❌ Error en la configuración de test_sessions');
    return false;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTestSessionsTable()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

export { setupTestSessionsTable, checkTableExists, createTestSessionsTable };
