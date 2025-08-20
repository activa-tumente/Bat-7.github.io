import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  FileText, 
  Download, 
  Print, 
  User, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Brain,
  Eye,
  Calculator,
  Zap,
  Settings,
  PenTool,
  BookOpen
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import InterpretacionesService from '../../services/InterpretacionesService';

/**
 * Componente mejorado para visualizar informes con interpretaciones cualitativas
 */
const EnhancedInformeViewer = ({ 
  informe, 
  onClose, 
  onDownload, 
  onPrint,
  showActions = true 
}) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [interpretaciones, setInterpretaciones] = useState(null);
  const [loading, setLoading] = useState(false);

  // Iconos para cada aptitud
  const aptitudIcons = {
    'V': BookOpen,    // Verbal
    'E': Eye,         // Espacial
    'R': Brain,       // Razonamiento
    'N': Calculator,  // Numérica
    'A': Zap,         // Atención
    'M': Settings,    // Mecánica
    'O': PenTool      // Ortografía
  };

  // Nombres completos de aptitudes
  const aptitudNombres = {
    'V': 'Aptitud Verbal',
    'E': 'Aptitud Espacial',
    'R': 'Razonamiento',
    'N': 'Aptitud Numérica',
    'A': 'Atención y Concentración',
    'M': 'Aptitud Mecánica',
    'O': 'Ortografía'
  };

  useEffect(() => {
    // Cargar interpretaciones si no están incluidas en el informe
    if (informe?.contenido?.resultados && !informe?.contenido?.interpretaciones) {
      loadInterpretaciones();
    } else if (informe?.contenido?.interpretaciones) {
      setInterpretaciones(informe.contenido.interpretaciones);
    }
  }, [informe]);

  const loadInterpretaciones = async () => {
    if (!informe?.contenido?.resultados) return;
    
    setLoading(true);
    try {
      const interpretacionesData = await InterpretacionesService.generarInterpretacionesCompletas(
        informe.contenido.resultados
      );
      setInterpretaciones(interpretacionesData);
    } catch (error) {
      console.error('Error cargando interpretaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentileColor = (percentil) => {
    if (percentil >= 85) return 'text-green-600 bg-green-50';
    if (percentil >= 75) return 'text-blue-600 bg-blue-50';
    if (percentil >= 25) return 'text-gray-600 bg-gray-50';
    if (percentil >= 15) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getPercentileIcon = (percentil) => {
    if (percentil >= 75) return <TrendingUp className="w-4 h-4" />;
    if (percentil < 25) return <TrendingDown className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  const renderPatientInfo = () => {
    const paciente = informe?.contenido?.paciente;
    if (!paciente) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
              <p className="text-lg font-semibold">{paciente.nombre} {paciente.apellido}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Documento</label>
              <p className="text-lg">{paciente.documento}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Edad</label>
              <p className="text-lg">{paciente.edad} años</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Evaluación</label>
              <p className="text-lg">{formatDate(informe.fecha_generacion)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResultadosResumen = () => {
    const resultados = informe?.contenido?.resultados || [];
    const estadisticas = informe?.contenido?.estadisticas;

    return (
      <div className="space-y-6">
        {/* Métricas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tests Aplicados</p>
                  <p className="text-2xl font-bold">{resultados.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Promedio Percentil</p>
                  <p className="text-2xl font-bold">{estadisticas?.promedioPercentil || 'N/A'}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fortalezas</p>
                  <p className="text-2xl font-bold">{estadisticas?.aptitudesDestacadas?.length || 0}</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados por Aptitud</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Aptitud</th>
                    <th className="text-center p-3">Puntaje Directo</th>
                    <th className="text-center p-3">Percentil</th>
                    <th className="text-center p-3">Nivel</th>
                    <th className="text-center p-3">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((resultado, index) => {
                    const IconComponent = aptitudIcons[resultado.aptitud_id] || Brain;
                    const nivel = InterpretacionesService.obtenerDescripcionNivel(resultado.percentil);
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <span className="font-medium">
                              {aptitudNombres[resultado.aptitud_id] || resultado.aptitud_id}
                            </span>
                          </div>
                        </td>
                        <td className="text-center p-3">{resultado.puntaje_directo}</td>
                        <td className="text-center p-3">
                          <Badge className={getPercentileColor(resultado.percentil)}>
                            {resultado.percentil}
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <span className="text-sm">{nivel}</span>
                        </td>
                        <td className="text-center p-3">
                          {getPercentileIcon(resultado.percentil)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderInterpretaciones = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando interpretaciones...</span>
        </div>
      );
    }

    if (!interpretaciones) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No hay interpretaciones cualitativas disponibles.</p>
            <Button onClick={loadInterpretaciones} className="mt-4">
              Generar Interpretaciones
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Resumen de fortalezas y áreas de desarrollo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fortalezas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="w-5 h-5" />
                Fortalezas Identificadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interpretaciones.resumen.fortalezas.length > 0 ? (
                <div className="space-y-3">
                  {interpretaciones.resumen.fortalezas.map((fortaleza, index) => {
                    const IconComponent = aptitudIcons[fortaleza.aptitud] || Brain;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <IconComponent className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">{fortaleza.nombre}</p>
                          <p className="text-sm text-gray-600">
                            Percentil {fortaleza.percentil} - {fortaleza.nivel}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No se identificaron fortalezas destacadas.</p>
              )}
            </CardContent>
          </Card>

          {/* Áreas de desarrollo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <TrendingDown className="w-5 h-5" />
                Áreas de Desarrollo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interpretaciones.resumen.areasDesarrollo.length > 0 ? (
                <div className="space-y-3">
                  {interpretaciones.resumen.areasDesarrollo.map((area, index) => {
                    const IconComponent = aptitudIcons[area.aptitud] || Brain;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <IconComponent className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium">{area.nombre}</p>
                          <p className="text-sm text-gray-600">
                            Percentil {area.percentil} - {area.nivel}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No se identificaron áreas que requieran desarrollo especial.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interpretaciones detalladas por aptitud */}
        <Card>
          <CardHeader>
            <CardTitle>Interpretaciones Detalladas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(interpretaciones.aptitudes || {}).map(([codigo, interpretacion]) => {
                const IconComponent = aptitudIcons[codigo] || Brain;
                return (
                  <div key={codigo} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold">
                        {aptitudNombres[codigo] || codigo}
                      </h3>
                      <Badge className={getPercentileColor(interpretacion.percentil)}>
                        Percentil {interpretacion.percentil}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Rendimiento</h4>
                        <p className="text-gray-600">{interpretacion.rendimiento}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Implicaciones Académicas</h4>
                        <p className="text-gray-600">{interpretacion.academico}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Orientación Vocacional</h4>
                        <p className="text-gray-600">{interpretacion.vocacional}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recomendaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {interpretaciones.resumen.recomendaciones.map((recomendacion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{recomendacion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!informe) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">No hay datos del informe disponibles.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{informe.titulo}</h1>
          <p className="text-gray-600">{informe.descripcion}</p>
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            {onDownload && (
              <Button variant="outline" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            )}
            {onPrint && (
              <Button variant="outline" onClick={onPrint}>
                <Print className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            )}
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Patient Info */}
      {renderPatientInfo()}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="interpretaciones">Interpretaciones</TabsTrigger>
          <TabsTrigger value="detalles">Detalles Técnicos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumen" className="mt-6">
          {renderResultadosResumen()}
        </TabsContent>
        
        <TabsContent value="interpretaciones" className="mt-6">
          {renderInterpretaciones()}
        </TabsContent>
        
        <TabsContent value="detalles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Técnica del Informe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID del Informe</label>
                  <p className="text-lg">{informe.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo de Informe</label>
                  <p className="text-lg capitalize">{informe.tipo_informe}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <Badge className="ml-2">{informe.estado}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Generación</label>
                  <p className="text-lg">{formatDate(informe.fecha_generacion)}</p>
                </div>
              </div>
              
              {informe.metadatos && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Metadatos</label>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                    {JSON.stringify(informe.metadatos, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedInformeViewer;