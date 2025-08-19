import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import supabase from '../../api/supabaseClient';
import EnhancedReportViewer from '../../components/reports/EnhancedReportViewer';

const ViewSavedReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('informes')
          .select(`
            id,
            titulo,
            contenido,
            tipo_informe,
            estado,
            fecha_generacion,
            generado_por,
            observaciones,
            pacientes:paciente_id (
              id,
              nombre,
              apellido,
              documento,
              genero,
              fecha_nacimiento,
              email,
              telefono
            )
          `)
          .eq('id', reportId)
          .single();

        if (error) {
          console.error('Error al cargar informe:', error);
          showToast('Error al cargar el informe', 'error');
          navigate('/student/informes-guardados');
          return;
        }

        setReport(data);
      } catch (error) {
        console.error('Error al cargar informe:', error);
        showToast('Error al cargar el informe', 'error');
        navigate('/student/informes-guardados');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId, navigate, showToast]);

  const getTestIcon = (testCode) => {
    const icons = {
      'V': 'fas fa-comments',
      'E': 'fas fa-cube',
      'A': 'fas fa-eye',
      'R': 'fas fa-puzzle-piece',
      'N': 'fas fa-calculator',
      'M': 'fas fa-cogs',
      'O': 'fas fa-spell-check'
    };
    return icons[testCode] || 'fas fa-clipboard-list';
  };

  const getTestColor = (testCode) => {
    const colors = {
      'V': 'blue',
      'E': 'indigo',
      'A': 'red',
      'R': 'amber',
      'N': 'teal',
      'M': 'slate',
      'O': 'green'
    };
    return colors[testCode] || 'gray';
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando informe guardado...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardBody>
            <div className="py-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
              <p className="text-gray-500">No se pudo cargar el informe.</p>
              <Button onClick={() => navigate('/student/informes-guardados')} className="mt-4">
                Volver a Informes
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const contenido = report.contenido;
  const paciente = contenido.paciente || report.pacientes;
  const isCompleteReport = report.tipo_informe === 'evaluacion_completa';

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header del informe */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 bg-${paciente?.genero === 'masculino' ? 'blue' : 'pink'}-100 rounded-full flex items-center justify-center mr-4`}>
            <i className={`fas ${paciente?.genero === 'masculino' ? 'fa-mars text-blue-600' : 'fa-venus text-pink-600'} text-2xl`}></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-800">
              {isCompleteReport ? 'Informe Completo Guardado' : 'Informe Individual Guardado'}
            </h1>
            <p className="text-gray-600">{paciente?.nombre} {paciente?.apellido}</p>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => navigate('/student/informes-guardados')}
            variant="outline"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Volver a Informes
          </Button>
          <Button 
            onClick={() => window.print()}
            variant="primary"
          >
            <i className="fas fa-print mr-2"></i>
            Imprimir
          </Button>
        </div>
      </div>

      {/* Información del informe */}
      <Card className="mb-6">
        <CardHeader className="bg-blue-50 border-b">
          <h2 className="text-xl font-semibold text-blue-800">
            <i className="fas fa-info-circle mr-2"></i>
            Información del Informe
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Título</p>
                <p className="text-lg font-semibold text-gray-900">{report.titulo}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Tipo de Informe</p>
                <p className="text-gray-900 capitalize">
                  {isCompleteReport ? 'Evaluación Completa' : 'Evaluación Individual'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  report.estado === 'generado' ? 'bg-blue-100 text-blue-800' :
                  report.estado === 'revisado' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {report.estado}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Fecha de Generación</p>
                <p className="text-gray-900">
                  {new Date(report.fecha_generacion).toLocaleString('es-ES')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Generado por</p>
                <p className="text-gray-900">{report.generado_por || 'Sistema'}</p>
              </div>
              
              {report.observaciones && (
                <div>
                  <p className="text-sm text-gray-500">Observaciones</p>
                  <p className="text-gray-900">{report.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Información del paciente */}
      <Card className="mb-6">
        <CardHeader className="bg-green-50 border-b">
          <h2 className="text-xl font-semibold text-blue-800">
            <i className="fas fa-user mr-2"></i>
            Información del Paciente
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nombre Completo</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paciente?.nombre} {paciente?.apellido}
                </p>
              </div>
              
              {paciente?.documento && (
                <div>
                  <p className="text-sm text-gray-500">Documento</p>
                  <p className="text-gray-900">{paciente.documento}</p>
                </div>
              )}
              
              {paciente?.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{paciente.email}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {paciente?.fecha_nacimiento && (
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="text-gray-900">
                    {new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Edad</p>
                <p className="text-gray-900">
                  {calculateAge(paciente?.fecha_nacimiento)} años
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Género</p>
                <p className="text-gray-900 capitalize">{paciente?.genero}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Contenido del informe mejorado */}
      <EnhancedReportViewer report={report} />

      {/* Footer del informe */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <p>Informe generado el {new Date(report.fecha_generacion).toLocaleDateString('es-ES')} a las {new Date(report.fecha_generacion).toLocaleTimeString('es-ES')}</p>
        <p className="mt-1">Sistema de Evaluación Psicológica - BAT-7</p>
      </div>
    </div>
  );
};

export default ViewSavedReport;
