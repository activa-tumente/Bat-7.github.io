-- Funciones para la gestión de usuarios desde la interfaz de administración

-- Función para cambiar la contraseña de un usuario (requiere permisos de administrador)
CREATE OR REPLACE FUNCTION change_user_password(user_id UUID, new_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario que ejecuta la función es administrador
  IF NOT EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND rol = 'administrador'
  ) THEN
    RAISE EXCEPTION 'Solo los administradores pueden cambiar contraseñas de otros usuarios';
  END IF;

  -- Actualizar la contraseña del usuario
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = user_id;

  RETURN FOUND;
END;
$$;

-- Función para eliminar un usuario (requiere permisos de administrador)
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario que ejecuta la función es administrador
  IF NOT EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND rol = 'administrador'
  ) THEN
    RAISE EXCEPTION 'Solo los administradores pueden eliminar usuarios';
  END IF;

  -- Eliminar el usuario de la tabla usuarios
  -- La eliminación en cascada se encargará de eliminar el registro en auth.users
  DELETE FROM usuarios
  WHERE id = user_id;

  RETURN FOUND;
END;
$$;

-- Función para crear un nuevo usuario (requiere permisos de administrador)
CREATE OR REPLACE FUNCTION create_user(
  email TEXT,
  password TEXT,
  nombre TEXT,
  apellido TEXT,
  documento TEXT,
  rol TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Verificar que el usuario que ejecuta la función es administrador
  IF NOT EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND rol = 'administrador'
  ) THEN
    RAISE EXCEPTION 'Solo los administradores pueden crear usuarios';
  END IF;

  -- Crear el usuario en auth.users
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    email,
    crypt(password, gen_salt('bf')),
    now(),
    jsonb_build_object('role', rol),
    jsonb_build_object('nombre', nombre, 'apellido', apellido, 'documento', documento)
  )
  RETURNING id INTO new_user_id;

  -- Crear el perfil del usuario en la tabla usuarios
  INSERT INTO usuarios (
    id,
    nombre,
    apellido,
    documento,
    rol
  ) VALUES (
    new_user_id,
    nombre,
    apellido,
    documento,
    rol
  );

  RETURN new_user_id;
END;
$$;

-- Otorgar permisos para ejecutar las funciones
GRANT EXECUTE ON FUNCTION change_user_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
