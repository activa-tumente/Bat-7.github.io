// src/scripts/setupAuthTables.js
import supabase from '../api/supabaseClient';
import { toast } from 'react-toastify';

/**
 * Script para configurar las tablas y funciones necesarias para la autenticación
 * Este script debe ejecutarse una vez para configurar la base de datos
 */
export const setupAuthTables = async () => {
  try {
    console.log('Configurando tablas de autenticación...');
    
    // Crear la tabla usuarios si no existe
    const { error: tableError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.usuarios (
          id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          documento TEXT UNIQUE,
          nombre TEXT,
          apellido TEXT,
          rol TEXT CHECK (rol IN ('estudiante', 'psicologo', 'administrador')),
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
        
        COMMENT ON TABLE public.usuarios IS 'Tabla de perfiles de usuario, complementa auth.users.';
        COMMENT ON COLUMN public.usuarios.id IS 'Referencia al ID del usuario en la tabla auth.users.';
        COMMENT ON COLUMN public.usuarios.documento IS 'Número de documento único del usuario, usado para login alternativo.';
        COMMENT ON COLUMN public.usuarios.rol IS 'Rol del usuario dentro del sistema.';
        
        -- HABILITAR Row Level Security
        ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (tableError) {
      console.error('Error al crear tabla usuarios:', tableError);
      toast.error('Error al crear tabla usuarios');
      return false;
    }
    
    // Crear políticas RLS
    const { error: policiesError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Políticas RLS
        -- Permitir a los usuarios leer su propio perfil
        DROP POLICY IF EXISTS "Permitir lectura del propio perfil" ON public.usuarios;
        CREATE POLICY "Permitir lectura del propio perfil" ON public.usuarios
        FOR SELECT USING (auth.uid() = id);
        
        -- Permitir a los usuarios actualizar su propio perfil
        DROP POLICY IF EXISTS "Permitir actualización del propio perfil" ON public.usuarios;
        CREATE POLICY "Permitir actualización del propio perfil" ON public.usuarios
        FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
        
        -- Permitir a administradores leer todos los perfiles
        DROP POLICY IF EXISTS "Permitir lectura a admins" ON public.usuarios;
        CREATE POLICY "Permitir lectura a admins" ON public.usuarios
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol = 'administrador'
          )
        );
        
        -- Permitir a administradores actualizar todos los perfiles
        DROP POLICY IF EXISTS "Permitir actualización a admins" ON public.usuarios;
        CREATE POLICY "Permitir actualización a admins" ON public.usuarios
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol = 'administrador'
          )
        ) WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND rol = 'administrador'
          )
        );
      `
    });
    
    if (policiesError) {
      console.error('Error al crear políticas RLS:', policiesError);
      toast.error('Error al crear políticas RLS');
      return false;
    }
    
    // Crear trigger para actualizar 'updated_at'
    const { error: triggerError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Trigger para actualizar 'updated_at' automáticamente
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Crear el trigger en la tabla
        DROP TRIGGER IF EXISTS on_usuarios_update ON public.usuarios;
        CREATE TRIGGER on_usuarios_update
        BEFORE UPDATE ON public.usuarios
        FOR EACH ROW
        EXECUTE PROCEDURE public.handle_updated_at();
      `
    });
    
    if (triggerError) {
      console.error('Error al crear trigger:', triggerError);
      toast.error('Error al crear trigger');
      return false;
    }
    
    // Crear función para buscar usuario por documento
    const { error: functionError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Función para buscar un usuario por documento
        CREATE OR REPLACE FUNCTION public.get_user_by_documento(documento_input TEXT)
        RETURNS TABLE (
          user_id UUID,
          email TEXT
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT u.id, au.email
          FROM public.usuarios u
          JOIN auth.users au ON u.id = au.id
          WHERE u.documento = documento_input;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Otorgar permisos para ejecutar la función
        GRANT EXECUTE ON FUNCTION public.get_user_by_documento TO anon, authenticated;
      `
    });
    
    if (functionError) {
      console.error('Error al crear función get_user_by_documento:', functionError);
      toast.error('Error al crear función get_user_by_documento');
      return false;
    }
    
    console.log('Tablas de autenticación configuradas correctamente');
    toast.success('Tablas de autenticación configuradas correctamente');
    return true;
  } catch (error) {
    console.error('Error al configurar tablas de autenticación:', error);
    toast.error('Error al configurar tablas de autenticación');
    return false;
  }
};

/**
 * Inserta usuarios de prueba en la tabla usuarios
 */
export const insertTestUsers = async () => {
  try {
    console.log('Insertando usuarios de prueba...');
    
    // Obtener IDs de los usuarios de auth.users
    const { data: adminData, error: adminError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', 'admin.test.bat7@gmail.com')
      .single();
      
    const { data: psicologoData, error: psicologoError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', 'profesional.test.bat7@gmail.com')
      .single();
      
    const { data: estudianteData, error: estudianteError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', 'estudiante.test.bat7@gmail.com')
      .single();
    
    if (adminError || psicologoError || estudianteError) {
      console.error('Error al obtener IDs de usuarios:', adminError || psicologoError || estudianteError);
      toast.error('Error al obtener IDs de usuarios');
      return false;
    }
    
    // Insertar usuarios en la tabla usuarios
    if (adminData) {
      const { error } = await supabase
        .from('usuarios')
        .upsert({
          id: adminData.id,
          documento: 'ADMIN001',
          nombre: 'Administrador',
          apellido: 'Test',
          rol: 'administrador'
        });
        
      if (error) {
        console.error('Error al insertar usuario administrador:', error);
        toast.error('Error al insertar usuario administrador');
        return false;
      }
    }
    
    if (psicologoData) {
      const { error } = await supabase
        .from('usuarios')
        .upsert({
          id: psicologoData.id,
          documento: 'PSICO001',
          nombre: 'Psicólogo',
          apellido: 'Test',
          rol: 'psicologo'
        });
        
      if (error) {
        console.error('Error al insertar usuario psicólogo:', error);
        toast.error('Error al insertar usuario psicólogo');
        return false;
      }
    }
    
    if (estudianteData) {
      const { error } = await supabase
        .from('usuarios')
        .upsert({
          id: estudianteData.id,
          documento: 'ESTUD001',
          nombre: 'Estudiante',
          apellido: 'Test',
          rol: 'estudiante'
        });
        
      if (error) {
        console.error('Error al insertar usuario estudiante:', error);
        toast.error('Error al insertar usuario estudiante');
        return false;
      }
    }
    
    console.log('Usuarios de prueba insertados correctamente');
    toast.success('Usuarios de prueba insertados correctamente');
    return true;
  } catch (error) {
    console.error('Error al insertar usuarios de prueba:', error);
    toast.error('Error al insertar usuarios de prueba');
    return false;
  }
};

export default {
  setupAuthTables,
  insertTestUsers
};
