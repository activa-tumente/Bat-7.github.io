import { useState, useEffect } from 'react';
import { FaUserMd, FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../api/supabaseClient';
import { toast } from 'react-toastify';

/**
 * Página de gestión de psicólogos
 * Solo accesible para administradores
 */
const Psychologists = () => {
  const { user, isAdmin } = useAuth();
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadPsychologists();
    }
  }, [isAdmin]);

  const loadPsychologists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('psicologos')
        .select('*')
        .order('nombre');

      if (error) throw error;

      setPsychologists(data || []);
    } catch (error) {
      console.error('Error al cargar psicólogos:', error);
      toast.error('Error al cargar la lista de psicólogos');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
        <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <FaSpinner className="animate-spin text-blue-600 text-3xl mr-3" />
        <span className="text-lg">Cargando psicólogos...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Psicólogos</h1>
            <p className="text-gray-600">
              Administra los psicólogos registrados en el sistema
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FaPlus className="mr-2" />
            Agregar Psicólogo
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaUserMd className="text-3xl text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Psicólogos</h3>
              <p className="text-2xl font-bold text-blue-600">{psychologists.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaUserMd className="text-3xl text-green-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Activos</h3>
              <p className="text-2xl font-bold text-green-600">
                {psychologists.filter(p => p.activo).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaUserMd className="text-3xl text-red-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Inactivos</h3>
              <p className="text-2xl font-bold text-red-600">
                {psychologists.filter(p => !p.activo).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de psicólogos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lista de Psicólogos</h2>
        </div>
        
        {psychologists.length === 0 ? (
          <div className="p-8 text-center">
            <FaUserMd className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay psicólogos registrados</h3>
            <p className="text-gray-600 mb-4">
              Comienza agregando el primer psicólogo al sistema
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Agregar Primer Psicólogo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Psicólogo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {psychologists.map((psychologist) => (
                  <tr key={psychologist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUserMd className="text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {psychologist.nombre} {psychologist.apellido}
                          </div>
                          <div className="text-sm text-gray-500">
                            {psychologist.email || 'Sin email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {psychologist.documento || 'Sin documento'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        psychologist.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {psychologist.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {psychologist.fecha_creacion 
                        ? new Date(psychologist.fecha_creacion).toLocaleDateString()
                        : 'No disponible'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FaEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Información</h3>
        <p className="text-sm text-blue-800">
          Los psicólogos pueden gestionar pacientes, crear evaluaciones y ver resultados. 
          Solo los administradores pueden agregar, editar o eliminar psicólogos del sistema.
        </p>
      </div>
    </div>
  );
};

export default Psychologists;
