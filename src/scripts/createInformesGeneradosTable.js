import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://ydglduxhgwajqdseqzpy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZ2xkdXhoZ3dhanFkc2VxenB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjMxMjg0MSwiZXhwIjoyMDYxODg4ODQxfQ.zwk3Wiay5jjeYOrg8B1M6T98B2esCqRFI43At-AFV3A';

// Crear cliente con service role key para operaciones administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL para crear la tabla informes_generados
const createTableSQL = `
-- Crear tabla informes_generados
CREATE TABLE IF NOT EXISTS public.informes_generados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL,
  tipo_informe character varying(50) NOT NULL,
  titulo character varying(255) NOT NULL,
  descripcion text NULL,
  contenido jsonb NOT NULL,
  archivo_url text NULL,
  estado character varying(20) NULL DEFAULT 'generado'::character varying,
  generado_por uuid NULL,
  fecha_generacion timestamp with time zone NULL DEFAULT now(),
  fecha_archivado timestamp with time zone NULL,
  metadatos jsonb NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT informes_generados_pkey PRIMARY KEY (id),
  CONSTRAINT informes_generados_generado_por_fkey FOREIGN KEY (generado_por) REFERENCES auth.users (id),
  CONSTRAINT informes_generados_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_informes_tipo ON public.informes_generados USING btree (tipo_informe);
CREATE INDEX IF NOT EXISTS idx_informes_estado ON public.informes_generados USING btree (estado);
CREATE INDEX IF NOT EXISTS idx_informes_generado_por ON public.informes_generados USING btree (generado_por);
CREATE INDEX IF NOT EXISTS idx_informes_paciente_id ON public.informes_generados USING btree (paciente_id);
CREATE INDEX IF NOT EXISTS idx_informes_fecha_generacion ON public.informes_generados USING btree (fecha_generacion);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_informes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_informes_updated_at ON informes_generados;
CREATE TRIGGER trigger_update_informes_updated_at
  BEFORE UPDATE ON informes_generados
  FOR EACH ROW
  EXECUTE FUNCTION update_informes_updated_at();

-- Habilitar RLS
ALTER TABLE public.informes_generados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver informes" ON public.informes_generados;
CREATE POLICY "Usuarios autenticados pueden ver informes" ON public.informes_generados
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar informes" ON public.informes_generados;
CREATE POLICY "Usuarios autenticados pueden insertar informes" ON public.informes_generados
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar informes" ON public.informes_generados;
CREATE POLICY "Usuarios autenticados pueden actualizar informes" ON public.informes_generados
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar informes" ON public.informes_generados;
CREATE POLICY "Usuarios autenticados pueden eliminar informes" ON public.informes_generados
  FOR DELETE USING (auth.role() = 'authenticated');
`;

async function createInformesGeneradosTable() {
  try {
    console.log('🚀 Iniciando creación de tabla informes_generados...');
    
    // Ejecutar el SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: createTableSQL
    });
    
    if (error) {
      console.error('❌ Error al crear la tabla:', error);
      
      // Intentar método alternativo usando múltiples consultas
      console.log('🔄 Intentando método alternativo...');
      
      // Dividir el SQL en consultas individuales
      const queries = createTableSQL
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0 && !q.startsWith('--'));
      
      for (const query of queries) {
        if (query.trim()) {
          console.log(`Ejecutando: ${query.substring(0, 50)}...`);
          const { error: queryError } = await supabase.rpc('exec_sql', {
            sql_query: query
          });
          
          if (queryError) {
            console.error(`❌ Error en consulta: ${queryError.message}`);
            // Continuar con la siguiente consulta
          } else {
            console.log('✅ Consulta ejecutada correctamente');
          }
        }
      }
    } else {
      console.log('✅ Tabla informes_generados creada exitosamente');
    }
    
    // Verificar que la tabla existe
    const { data: tableExists, error: checkError } = await supabase
      .from('informes_generados')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error al verificar la tabla:', checkError);
    } else {
      console.log('✅ Tabla informes_generados verificada y accesible');
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la función
createInformesGeneradosTable()
  .then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });