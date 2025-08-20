import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import supabase from '../../api/supabaseClient';
import { interpretacionesAptitudes, obtenerInterpretacion } from '../../data/interpretacionesAptitudes';

const ViewSavedReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
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
          toast.error('Error al cargar el informe');
          navigate('/admin/informes-guardados');
          return;
        }

        setReport(data);
      } catch (error) {
        console.error('Error al cargar informe:', error);
        toast.error('Error al cargar el informe');
        navigate('/admin/informes-guardados');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId, navigate]);

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
              <Button onClick={() => navigate('/admin/informes-guardados')} className="mt-4">
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
  const results = contenido.resultados || [];

  // Calcular estadísticas del resumen
  const totalTests = results.length;
  const resultsWithPercentiles = results.filter(r => r.puntajes?.percentil);
  const promedioPercentil = resultsWithPercentiles.length > 0
    ? Math.round(resultsWithPercentiles.reduce((sum, r) => sum + r.puntajes.percentil, 0) / resultsWithPercentiles.length)
    : 0;
  const aptitudesAltas = resultsWithPercentiles.filter(r => r.puntajes.percentil >= 75).length;
  const aptitudesReforzar = resultsWithPercentiles.filter(r => r.puntajes.percentil <= 25).length;

  // Calcular índices especiales
  const getTestByCode = (code) => resultsWithPercentiles.find(r => r.test?.codigo === code);

  // Inteligencia Fluida (Gf): R + N
  const testR = getTestByCode('R');
  const testN = getTestByCode('N');
  const gfPercentiles = [testR?.puntajes?.percentil, testN?.puntajes?.percentil].filter(p => p !== undefined);
  const indiceGf = gfPercentiles.length > 0 ? Math.round(gfPercentiles.reduce((a, b) => a + b, 0) / gfPercentiles.length) : null;

  // Inteligencia Cristalizada (Gc): V + O
  const testV = getTestByCode('V');
  const testO = getTestByCode('O');
  const gcPercentiles = [testV?.puntajes?.percentil, testO?.puntajes?.percentil].filter(p => p !== undefined);
  const indiceGc = gcPercentiles.length > 0 ? Math.round(gcPercentiles.reduce((a, b) => a + b, 0) / gcPercentiles.length) : null;

  // Capacidad General (g): promedio de todos los tests
  const indiceG = promedioPercentil;

  // Función para obtener interpretación cualitativa de índices
  const getIndiceInterpretation = (indice, percentil) => {
    if (!percentil) return { nivel: 'No evaluado', descripcion: 'No hay datos suficientes para evaluar este índice.' };

    let nivel, descripcion, caracteristicas;

    if (percentil >= 75) {
      nivel = 'Alto';
    } else if (percentil >= 25) {
      nivel = 'Promedio';
    } else {
      nivel = 'Bajo';
    }

    switch (indice) {
      case 'g':
        if (nivel === 'Alto') {
          descripcion = 'Capacidad general elevada para comprender situaciones complejas, razonar y resolver problemas de manera efectiva.';
          caracteristicas = [
            'Habilidad para resolver eficientemente problemas complejos y novedosos',
            'Buena capacidad para formular y contrastar hipótesis',
            'Facilidad para abstraer información e integrarla con conocimiento previo',
            'Elevado potencial para adquirir nuevos conocimientos'
          ];
        } else if (nivel === 'Promedio') {
          descripcion = 'Capacidad general dentro del rango esperado para resolver problemas y comprender situaciones.';
          caracteristicas = [
            'Capacidad adecuada para resolver problemas de complejidad moderada',
            'Habilidades de razonamiento en desarrollo',
            'Potencial de aprendizaje dentro del rango promedio'
          ];
        } else {
          descripcion = 'Dificultades en la capacidad general para resolver problemas complejos y comprender relaciones abstractas.';
          caracteristicas = [
            'Dificultades para aplicar el razonamiento a problemas complejos',
            'Limitaciones para formar juicios que requieran abstracción',
            'Posible necesidad de enseñanza más directiva y supervisada'
          ];
        }
        break;

      case 'Gf':
        if (nivel === 'Alto') {
          descripcion = 'Excelente capacidad para el razonamiento inductivo y deductivo con problemas novedosos.';
          caracteristicas = [
            'Habilidad sobresaliente para aplicar razonamiento a problemas novedosos',
            'Facilidad para identificar reglas y formular hipótesis',
            'Nivel alto de razonamiento analítico',
            'Buena integración de información visual y verbal'
          ];
        } else if (nivel === 'Promedio') {
          descripcion = 'Capacidad adecuada para el razonamiento con contenidos abstractos y formales.';
          caracteristicas = [
            'Habilidades de razonamiento en desarrollo',
            'Capacidad moderada para resolver problemas novedosos',
            'Estrategias de resolución en proceso de consolidación'
          ];
        } else {
          descripcion = 'Dificultades en el razonamiento inductivo y deductivo con problemas abstractos.';
          caracteristicas = [
            'Uso de estrategias poco eficaces para problemas novedosos',
            'Falta de flexibilidad en soluciones alternativas',
            'Dificultades para identificar reglas subyacentes',
            'Integración defectuosa de información visual y verbal'
          ];
        }
        break;

      case 'Gc':
        if (nivel === 'Alto') {
          descripcion = 'Excelente dominio de conocimientos adquiridos culturalmente y habilidades verbales.';
          caracteristicas = [
            'Habilidad para captar relaciones entre conceptos verbales',
            'Buena capacidad de comprensión y expresión del lenguaje',
            'Buen nivel de conocimiento léxico y ortográfico',
            'Posiblemente buen nivel de cultura general'
          ];
        } else if (nivel === 'Promedio') {
          descripcion = 'Conocimientos verbales y culturales dentro del rango esperado.';
          caracteristicas = [
            'Comprensión verbal adecuada para la edad',
            'Conocimientos léxicos en desarrollo',
            'Habilidades de expresión en proceso de consolidación'
          ];
        } else {
          descripcion = 'Limitaciones en conocimientos verbales y habilidades de lenguaje adquiridas culturalmente.';
          caracteristicas = [
            'Procesamiento parcial de relaciones entre conceptos verbales',
            'Dificultades en comprensión y expresión del lenguaje',
            'Limitaciones en conocimiento léxico y ortográfico',
            'Posible nivel bajo de cultura general'
          ];
        }
        break;

      default:
        descripcion = 'Interpretación no disponible para este índice.';
        caracteristicas = [];
    }

    return { nivel, descripcion, caracteristicas };
  };

  // Función para generar PDF
  const generatePDF = () => {
    // Ocultar elementos que no deben aparecer en el PDF
    const elementsToHide = document.querySelectorAll('.print-hide');
    elementsToHide.forEach(el => el.style.display = 'none');

    // Aplicar optimizaciones para PDF
    const container = document.querySelector('.container');
    const body = document.body;
    const html = document.documentElement;

    // Guardar clases originales
    const originalContainerClass = container?.className;
    const originalBodyClass = body?.className;
    const originalHtmlClass = html?.className;

    // Aplicar clases de optimización
    if (container) container.className += ' print-optimize';
    if (body) body.className += ' print-optimize';
    if (html) html.className += ' print-optimize';

    // Aplicar estilos adicionales temporalmente
    const tempStyle = document.createElement('style');
    tempStyle.textContent = `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .space-y-6 > * + * {
          margin-top: 0.5rem !important;
        }
        .mb-6 {
          margin-bottom: 0.5rem !important;
        }
        .py-6 {
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
      }
    `;
    document.head.appendChild(tempStyle);

    // Configurar el título del documento
    const originalTitle = document.title;
    document.title = `Informe_${paciente?.nombre}_${paciente?.apellido}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}`;

    // Imprimir
    window.print();

    // Restaurar elementos ocultos y clases originales
    setTimeout(() => {
      elementsToHide.forEach(el => el.style.display = '');
      if (container && originalContainerClass) container.className = originalContainerClass;
      if (body && originalBodyClass) body.className = originalBodyClass;
      if (html && originalHtmlClass) html.className = originalHtmlClass;
      document.head.removeChild(tempStyle);
      document.title = originalTitle;
    }, 1000);
  };

  // Obtener fechas de evaluación
  const fechasEvaluacion = results.map(r => new Date(r.fecha_evaluacion)).filter(d => !isNaN(d));
  const primeraEvaluacion = fechasEvaluacion.length > 0 ? new Date(Math.min(...fechasEvaluacion)) : null;
  const ultimaEvaluacion = fechasEvaluacion.length > 0 ? new Date(Math.max(...fechasEvaluacion)) : null;

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
              Informe Completo de Evaluación - Admin
            </h1>
            <p className="text-gray-600">{paciente?.nombre} {paciente?.apellido}</p>
          </div>
        </div>

        <div className="flex justify-center space-x-4 print-hide">
          <Button
            onClick={() => navigate('/admin/informes-guardados')}
            variant="outline"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Volver
          </Button>
          <Button
            onClick={generatePDF}
            variant="primary"
          >
            <i className="fas fa-file-pdf mr-2"></i>
            Generar PDF
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
          >
            <i className="fas fa-print mr-2"></i>
            Imprimir
          </Button>
        </div>
      </div>

      {/* Información del paciente */}
      <Card className="mb-6 print-keep-together shadow-lg border-l-4 border-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b-2 border-blue-200">
          <div className="flex items-center">
            <div className={`w-12 h-12 bg-${paciente?.genero === 'masculino' ? 'blue' : 'pink'}-100 rounded-full flex items-center justify-center mr-4`}>
              <i className={`fas ${paciente?.genero === 'masculino' ? 'fa-mars text-blue-600' : 'fa-venus text-pink-600'} text-xl`}></i>
            </div>
            <h2 className="text-xl font-semibold text-blue-800">
              <i className="fas fa-user mr-2"></i>
              Información del Paciente
            </h2>
          </div>
        </CardHeader>
        <CardBody className="bg-white">
          {/* Versión normal para pantalla */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
            {/* Columna 1 - Información Personal */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Nombre Completo</p>
                <p className="text-lg font-bold text-gray-900">
                  {paciente?.nombre} {paciente?.apellido}
                </p>
              </div>

              {paciente?.documento && (
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Documento</p>
                  <p className="text-base font-semibold text-gray-900">{paciente.documento}</p>
                </div>
              )}
            </div>

            {/* Columna 2 - Información Demográfica */}
            <div className="space-y-4">
              {paciente?.fecha_nacimiento && (
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Fecha de Nacimiento</p>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}

              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">Edad</p>
                <p className="text-base font-semibold text-gray-900">
                  {calculateAge(paciente?.fecha_nacimiento)} años
                </p>
              </div>
            </div>

            {/* Columna 3 - Información de Contacto */}
            <div className="space-y-4">
              <div className={`bg-${paciente?.genero === 'masculino' ? 'blue' : 'pink'}-50 p-4 rounded-lg border-l-4 border-${paciente?.genero === 'masculino' ? 'blue' : 'pink'}-400`}>
                <p className={`text-xs font-medium text-${paciente?.genero === 'masculino' ? 'blue' : 'pink'}-600 uppercase tracking-wide mb-1`}>Género</p>
                <p className="text-base font-semibold text-gray-900 capitalize flex items-center">
                  <i className={`fas ${paciente?.genero === 'masculino' ? 'fa-mars text-blue-600' : 'fa-venus text-pink-600'} mr-2`}></i>
                  {paciente?.genero}
                </p>
              </div>

              {paciente?.email && (
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                  <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-900 break-all">{paciente.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Versión compacta para PDF */}
          <div className="hidden print:block">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="mb-2">
                  <span className="font-medium text-blue-600">Nombre:</span>
                  <span className="ml-2 font-bold">{paciente?.nombre} {paciente?.apellido}</span>
                </div>
                {paciente?.documento && (
                  <div className="mb-2">
                    <span className="font-medium text-gray-600">Documento:</span>
                    <span className="ml-2">{paciente.documento}</span>
                  </div>
                )}
                {paciente?.email && (
                  <div className="mb-2">
                    <span className="font-medium text-orange-600">Email:</span>
                    <span className="ml-2 text-xs">{paciente.email}</span>
                  </div>
                )}
              </div>
              <div>
                {paciente?.fecha_nacimiento && (
                  <div className="mb-2">
                    <span className="font-medium text-green-600">Fecha de Nacimiento:</span>
                    <span className="ml-2">{new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
                <div className="mb-2">
                  <span className="font-medium text-purple-600">Edad:</span>
                  <span className="ml-2">{calculateAge(paciente?.fecha_nacimiento)} años</span>
                </div>
                <div className="mb-2">
                  <span className={`font-medium text-${paciente?.genero === 'masculino' ? 'blue' : 'pink'}-600`}>Género:</span>
                  <span className="ml-2 capitalize">
                    <i className={`fas ${paciente?.genero === 'masculino' ? 'fa-mars text-blue-600' : 'fa-venus text-pink-600'} mr-1`}></i>
                    {paciente?.genero}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Resumen general */}
      <Card className="mb-6 print-keep-together">
        <CardHeader className="bg-purple-50 border-b">
          <h2 className="text-xl font-semibold text-blue-800">
            <i className="fas fa-chart-pie mr-2"></i>
            Resumen General
          </h2>
        </CardHeader>
        <CardBody className="print-compact">
          {/* Primera fila - Estadísticas básicas */}
          <div className="grid grid-cols-1 md:grid-cols-4 print-grid-horizontal gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalTests}
              </div>
              <div className="text-sm font-medium text-blue-700">
                Tests Completados
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {promedioPercentil}
              </div>
              <div className="text-sm font-medium text-green-700">
                Percentil Promedio
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {aptitudesAltas}
              </div>
              <div className="text-sm font-medium text-purple-700">
                Aptitudes Altas (≥75)
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {aptitudesReforzar}
              </div>
              <div className="text-sm font-medium text-orange-700">
                Aptitudes a Reforzar (≤25)
              </div>
            </div>
          </div>

          {/* Segunda fila - Índices especializados */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Índices Especializados BAT-7</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 print-grid-horizontal gap-6">
              <div className="text-center p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                <div className="text-2xl font-bold text-indigo-600 mb-2">
                  {promedioPercentil}
                </div>
                <div className="text-sm font-medium text-indigo-700">
                  Total BAT
                </div>
                <div className="text-xs text-indigo-600 mt-1">
                  Capacidad General
                </div>
              </div>

              <div className="text-center p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                <div className="text-2xl font-bold text-cyan-600 mb-2">
                  {indiceG}
                </div>
                <div className="text-sm font-medium text-cyan-700">
                  Índice g
                </div>
                <div className="text-xs text-cyan-600 mt-1">
                  Capacidad General
                </div>
              </div>

              <div className="text-center p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
                <div className="text-2xl font-bold text-teal-600 mb-2">
                  {indiceGf || 'N/A'}
                </div>
                <div className="text-sm font-medium text-teal-700">
                  Índice Gf
                </div>
                <div className="text-xs text-teal-600 mt-1">
                  Inteligencia Fluida
                </div>
              </div>

              <div className="text-center p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                  {indiceGc || 'N/A'}
                </div>
                <div className="text-sm font-medium text-emerald-700">
                  Índice Gc
                </div>
                <div className="text-xs text-emerald-600 mt-1">
                  Inteligencia Cristalizada
                </div>
              </div>
            </div>
          </div>

          {/* Fechas de evaluación */}
          <div className="mt-6 flex justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Primera evaluación:</span> {primeraEvaluacion ? primeraEvaluacion.toLocaleDateString('es-ES') : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Última evaluación:</span> {ultimaEvaluacion ? ultimaEvaluacion.toLocaleDateString('es-ES') : 'N/A'}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Resultados detallados */}
      <Card className="mb-6 print-keep-together">
        <CardHeader className="bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-blue-800">
            <i className="fas fa-list-alt mr-2"></i>
            Resultados Detallados por Aptitud
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          {results.length === 0 ? (
            <div className="py-8 text-center">
              <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No hay resultados de tests disponibles para este paciente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Tabla horizontal estilo ejemplo */}
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-4 py-3 text-left font-semibold">S</th>
                    <th className="px-4 py-3 text-left font-semibold">APTITUDES EVALUADAS</th>
                    <th className="px-4 py-3 text-center font-semibold">PD</th>
                    <th className="px-4 py-3 text-center font-semibold">PC</th>
                    <th className="px-4 py-3 text-left font-semibold">PERFIL DE LAS APTITUDES</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => {
                    const testColor = getTestColor(result.test?.codigo);
                    const percentil = result.puntajes?.percentil || 0;

                    // Determinar color de la barra basado en el percentil
                    let barColor = 'bg-blue-500';
                    if (percentil >= 80) barColor = 'bg-orange-500';
                    else if (percentil >= 60) barColor = 'bg-blue-500';
                    else if (percentil >= 40) barColor = 'bg-blue-400';
                    else barColor = 'bg-blue-300';

                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3">
                          <div className={`w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                            {result.test?.codigo}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{result.test?.nombre}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900">
                          {result.puntajes?.puntaje_directo || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900">
                          {result.puntajes?.percentil || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-6 mr-3">
                              <div
                                className={`${barColor} h-6 rounded-full flex items-center justify-end pr-2`}
                                style={{ width: `${Math.max(percentil, 5)}%` }}
                              >
                                <span className="text-white text-xs font-bold">
                                  {percentil > 0 ? percentil : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Interpretación Cualitativa */}
      {results.length > 0 && (
        <Card className="mb-6 print-keep-together">
          <CardHeader className="bg-purple-50 border-b">
            <h2 className="text-xl font-semibold text-blue-800">
              <i className="fas fa-brain mr-2"></i>
              Interpretación Cualitativa de Aptitudes
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {results.map((result, index) => {
                const interpretacion = obtenerInterpretacion(result.test?.codigo, result.puntajes?.percentil || 0);

                if (!interpretacion) return null;

                return (
                  <div key={index} className="border-l-4 border-blue-500 pl-6 py-4 bg-gray-50 rounded-r-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {result.test?.codigo}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {result.test?.nombre} - Nivel {interpretacion.nivel}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Percentil: {result.puntajes?.percentil || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Descripción:</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {interpretacion.descripcion}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        Características {interpretacion.nivel === 'Alto' ? 'Fortalezas' : 'Áreas de Mejora'}:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {interpretacion.caracteristicas.map((caracteristica, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {caracteristica}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Interpretación Cualitativa de Índices */}
      <Card className="mb-6 print-keep-together">
        <CardHeader className="bg-indigo-50 border-b">
          <h2 className="text-xl font-semibold text-blue-800">
            <i className="fas fa-chart-line mr-2"></i>
            Interpretación Cualitativa de Índices Especializados
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {/* Total BAT / Índice g */}
            {promedioPercentil && (
              <div className="border-l-4 border-indigo-500 pl-6 py-4 bg-indigo-50 rounded-r-lg">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    g
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Índice g - Capacidad General: {getIndiceInterpretation('g', indiceG).nivel}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Percentil: {indiceG}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Descripción:</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {getIndiceInterpretation('g', indiceG).descripcion}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Características:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {getIndiceInterpretation('g', indiceG).caracteristicas.map((caracteristica, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {caracteristica}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Índice Gf */}
            {indiceGf && (
              <div className="border-l-4 border-teal-500 pl-6 py-4 bg-teal-50 rounded-r-lg">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    Gf
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Índice Gf - Inteligencia Fluida: {getIndiceInterpretation('Gf', indiceGf).nivel}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Percentil: {indiceGf} (basado en R + N)
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Descripción:</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {getIndiceInterpretation('Gf', indiceGf).descripcion}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Características:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {getIndiceInterpretation('Gf', indiceGf).caracteristicas.map((caracteristica, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {caracteristica}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Índice Gc */}
            {indiceGc && (
              <div className="border-l-4 border-emerald-500 pl-6 py-4 bg-emerald-50 rounded-r-lg">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    Gc
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Índice Gc - Inteligencia Cristalizada: {getIndiceInterpretation('Gc', indiceGc).nivel}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Percentil: {indiceGc} (basado en V + O)
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Descripción:</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {getIndiceInterpretation('Gc', indiceGc).descripcion}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Características:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {getIndiceInterpretation('Gc', indiceGc).caracteristicas.map((caracteristica, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {caracteristica}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Análisis de disparidad si existe */}
            {indiceGf && indiceGc && Math.abs(indiceGf - indiceGc) > 15 && (
              <div className="border-l-4 border-yellow-500 pl-6 py-4 bg-yellow-50 rounded-r-lg">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    <i className="fas fa-balance-scale"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Análisis de Disparidad entre Índices
                    </h3>
                  </div>
                </div>

                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Se observa una diferencia significativa entre la Inteligencia Fluida (Gf: {indiceGf}) y la
                    Inteligencia Cristalizada (Gc: {indiceGc}). Esta disparidad sugiere un perfil cognitivo
                    heterogéneo que requiere consideración especial en las recomendaciones de intervención.
                    {indiceGf > indiceGc ?
                      ' El evaluado muestra mayor fortaleza en razonamiento abstracto que en conocimientos adquiridos.' :
                      ' El evaluado muestra mayor fortaleza en conocimientos adquiridos que en razonamiento abstracto.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Recomendaciones Generales */}
      <Card className="mb-6 print-keep-together">
        <CardHeader className="bg-yellow-50 border-b">
          <h2 className="text-xl font-semibold text-blue-800">
            <i className="fas fa-lightbulb mr-2"></i>
            Recomendaciones Generales
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Análisis General del Rendimiento</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                El evaluado presenta un percentil promedio de {promedioPercentil}, lo que indica un rendimiento{' '}
                {promedioPercentil >= 70 ? 'por encima del promedio' :
                 promedioPercentil >= 30 ? 'en el rango promedio' : 'por debajo del promedio'}{' '}
                en las aptitudes evaluadas.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Recomendaciones Específicas</h4>
              <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                <li>Realizar seguimiento periódico del progreso en todas las aptitudes</li>
                <li>Considerar la aplicación de tests complementarios según las necesidades identificadas</li>
                <li>Mantener un registro detallado de las intervenciones y su efectividad</li>
                {aptitudesAltas > 0 && (
                  <li>Considerar actividades de enriquecimiento en las aptitudes con alto rendimiento</li>
                )}
                {aptitudesReforzar > 0 && (
                  <li>Implementar estrategias de apoyo en las aptitudes con rendimiento bajo</li>
                )}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Footer del informe */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <p>Informe generado el {new Date(report.fecha_generacion).toLocaleDateString('es-ES')} a las {new Date(report.fecha_generacion).toLocaleTimeString('es-ES')}</p>
        <p className="mt-1">Sistema de Evaluación Psicológica - BAT-7 - Panel de Administración</p>
      </div>
    </div>
  );
};

export default ViewSavedReport;
