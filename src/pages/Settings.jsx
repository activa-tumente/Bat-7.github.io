import React, { useState, useEffect } from 'react';
import { FaSpinner, FaSave, FaBell, FaMoon, FaSun, FaLanguage, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import supabase from '../api/supabaseClient';

/**
 * Página de configuración de la aplicación
 * Permite al usuario personalizar su experiencia en la aplicación
 */
const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado para las preferencias de usuario
  const [settings, setSettings] = useState({
    theme: 'light', // light, dark, system
    language: 'es', // es, en
    notifications: {
      email: true,
      browser: true,
      mobile: false,
    },
    display: {
      fontSize: 'medium', // small, medium, large
      compactView: false,
      highContrast: false,
    },
  });

  // Cargar datos del usuario y configuraciones al montar el componente
  useEffect(() => {
    const loadUserSettings = async () => {
      if (authLoading) return; // Esperar a que termine la carga de auth

      setLoading(true);
      try {
        if (user) {
          // Obtener configuraciones de la base de datos
          const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data && !error) {
            // Si hay configuraciones guardadas, actualizarlas
            setSettings(prevSettings => ({
              ...prevSettings,
              ...(data.settings || {}),
            }));
          } else {
            // Si no existen configuraciones, usar las predeterminadas
            // También detectar preferencias del sistema si es posible
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setSettings(prevSettings => ({
              ...prevSettings,
              theme: prefersDarkMode ? 'dark' : 'light',
            }));
          }
        }
      } catch (error) {
        console.error('Error al cargar configuraciones:', error);
        toast.error('No se pudieron cargar las configuraciones');
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, [user, authLoading]);

  // Manejar cambios en las configuraciones
  const handleSettingChange = (section, setting, value) => {
    setSettings(prevSettings => {
      if (section) {
        return {
          ...prevSettings,
          [section]: {
            ...prevSettings[section],
            [setting]: value,
          },
        };
      } else {
        return {
          ...prevSettings,
          [setting]: value,
        };
      }
    });
  };

  // Guardar configuraciones
  const handleSaveSettings = async () => {
    if (!user) {
      toast.error('Debe iniciar sesión para guardar configuraciones');
      return;
    }

    setSaving(true);
    try {
      // Guardar en la base de datos
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: settings,
          updated_at: new Date(),
        });

      if (error) throw error;

      // Aplicar configuraciones
      applySettings(settings);
      
      toast.success('Configuraciones guardadas correctamente');
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
      toast.error('Error al guardar configuraciones');
    } finally {
      setSaving(false);
    }
  };

  // Aplicar configuraciones en tiempo real
  const applySettings = (settings) => {
    // Tema
    const body = document.body;
    if (settings.theme === 'dark') {
      body.classList.add('dark-mode');
    } else if (settings.theme === 'light') {
      body.classList.remove('dark-mode');
    } else if (settings.theme === 'system') {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDarkMode ? body.classList.add('dark-mode') : body.classList.remove('dark-mode');
    }

    // Tamaño de fuente
    body.classList.remove('font-small', 'font-medium', 'font-large');
    body.classList.add(`font-${settings.display.fontSize}`);

    // Contraste alto
    if (settings.display.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Vista compacta
    if (settings.display.compactView) {
      body.classList.add('compact-view');
    } else {
      body.classList.remove('compact-view');
    }

    // Guardar algunas preferencias en localStorage para persistencia
    localStorage.setItem('userTheme', settings.theme);
    localStorage.setItem('userLanguage', settings.language);
  };

  // Aplicar configuraciones cada vez que cambien
  useEffect(() => {
    // Solo aplicar si no está cargando inicialmente
    if (!loading) {
      applySettings(settings);
    }
  }, [settings, loading]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
        <span className="ml-2">Cargando configuraciones...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-600">
          Personaliza tu experiencia en la aplicación
        </p>
      </header>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Sección de tema y apariencia */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FaCog className="mr-2 text-gray-500" />
            Apariencia
          </h2>

          <div className="space-y-6">
            {/* Selector de tema */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleSettingChange(null, 'theme', 'light')}
                  className={`flex flex-col items-center p-3 rounded-lg ${
                    settings.theme === 'light'
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                  } transition-colors`}
                >
                  <FaSun className="h-6 w-6 text-yellow-500 mb-2" />
                  <span className="text-sm font-medium">Claro</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSettingChange(null, 'theme', 'dark')}
                  className={`flex flex-col items-center p-3 rounded-lg ${
                    settings.theme === 'dark'
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                  } transition-colors`}
                >
                  <FaMoon className="h-6 w-6 text-gray-700 mb-2" />
                  <span className="text-sm font-medium">Oscuro</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSettingChange(null, 'theme', 'system')}
                  className={`flex flex-col items-center p-3 rounded-lg ${
                    settings.theme === 'system'
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                  } transition-colors`}
                >
                  <div className="h-6 w-6 flex items-center justify-center mb-2">
                    <FaSun className="h-4 w-4 text-yellow-500" />
                    <FaMoon className="h-4 w-4 text-gray-700 ml-1" />
                  </div>
                  <span className="text-sm font-medium">Sistema</span>
                </button>
              </div>
            </div>

            {/* Tamaño de fuente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño de fuente
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleSettingChange('display', 'fontSize', 'small')}
                  className={`px-4 py-2 rounded-md ${
                    settings.display.fontSize === 'small'
                      ? 'bg-blue-100 border border-blue-500'
                      : 'bg-gray-100 border border-transparent hover:bg-gray-200'
                  } transition-colors`}
                >
                  <span className="text-xs">Pequeño</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSettingChange('display', 'fontSize', 'medium')}
                  className={`px-4 py-2 rounded-md ${
                    settings.display.fontSize === 'medium'
                      ? 'bg-blue-100 border border-blue-500'
                      : 'bg-gray-100 border border-transparent hover:bg-gray-200'
                  } transition-colors`}
                >
                  <span className="text-sm">Mediano</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSettingChange('display', 'fontSize', 'large')}
                  className={`px-4 py-2 rounded-md ${
                    settings.display.fontSize === 'large'
                      ? 'bg-blue-100 border border-blue-500'
                      : 'bg-gray-100 border border-transparent hover:bg-gray-200'
                  } transition-colors`}
                >
                  <span className="text-base">Grande</span>
                </button>
              </div>
            </div>

            {/* Opciones de visualización */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opciones de visualización
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="compactView"
                    name="compactView"
                    type="checkbox"
                    checked={settings.display.compactView}
                    onChange={(e) => handleSettingChange('display', 'compactView', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="compactView" className="ml-2 block text-sm text-gray-700">
                    Vista compacta (reduce espaciado)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="highContrast"
                    name="highContrast"
                    type="checkbox"
                    checked={settings.display.highContrast}
                    onChange={(e) => handleSettingChange('display', 'highContrast', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="highContrast" className="ml-2 block text-sm text-gray-700">
                    Alto contraste (mejora accesibilidad)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de idioma */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FaLanguage className="mr-2 text-gray-500" />
            Idioma
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar idioma
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange(null, 'language', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección de notificaciones */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FaBell className="mr-2 text-gray-500" />
            Notificaciones
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Notificaciones por email</h3>
                <p className="text-xs text-gray-500">Recibir alertas y recordatorios en su correo</p>
              </div>
              <div className="ml-4">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`slider ${settings.notifications.email ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}>
                    <span className={`toggle ${settings.notifications.email ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Notificaciones en el navegador</h3>
                <p className="text-xs text-gray-500">Recibir alertas mientras usa la aplicación</p>
              </div>
              <div className="ml-4">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.browser}
                    onChange={(e) => handleSettingChange('notifications', 'browser', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`slider ${settings.notifications.browser ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}>
                    <span className={`toggle ${settings.notifications.browser ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Notificaciones móviles</h3>
                <p className="text-xs text-gray-500">Recibir alertas en su dispositivo móvil</p>
              </div>
              <div className="ml-4">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.mobile}
                    onChange={(e) => handleSettingChange('notifications', 'mobile', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`slider ${settings.notifications.mobile ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}>
                    <span className={`toggle ${settings.notifications.mobile ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Guardar cambios */}
        <div className="p-6 bg-gray-50">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
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
                  Guardar configuración
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
