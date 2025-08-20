import supabase from './supabaseClient';
import { toast } from 'react-toastify';

/**
 * Mapeo de códigos de test a códigos de aptitud
 */
const TEST_APTITUDE_MAP = {
  'verbal': 'V',
  'espacial': 'E',
  'atencion': 'A',
  'razonamiento': 'R',
  'numerico': 'N',
  'mecanico': 'M',
  'ortografia': 'O'
};

/**
 * Obtener el ID de aptitud por código
 */
async function getAptitudeId(testType) {
  try {
    const aptitudeCode = TEST_APTITUDE_MAP[testType];
    if (!aptitudeCode) {
      throw new Error(`Tipo de test no reconocido: ${testType}`);
    }

    const { data, error } = await supabase
      .from('aptitudes')
      .select('id')
      .eq('codigo', aptitudeCode)
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error al obtener ID de aptitud:', error);
    throw error;
  }
}

/**
 * Calcular concentración basada en resultados de atención
 */
function calculateConcentration(atencionScore, errores = 0) {
  if (!atencionScore || atencionScore === 0) return 0;
  return ((atencionScore / (atencionScore + errores)) * 100);
}

/**
 * Guardar resultado de test en Supabase
 */
export async function saveTestResult({
  patientId,
  testType,
  correctCount,
  incorrectCount,
  unansweredCount,
  timeUsed,
  totalQuestions,
  answers = {},
  errores = 0
}) {
  try {
    // Validar parámetros requeridos
    if (!patientId) {
      throw new Error('ID del paciente es requerido');
    }

    if (!testType) {
      throw new Error('Tipo de test es requerido');
    }

    // Obtener ID de aptitud
    const aptitudeId = await getAptitudeId(testType);

    // Calcular puntaje directo
    const puntajeDirecto = correctCount || 0;

    // Calcular concentración si es test de atención
    let concentracion = null;
    if (testType === 'atencion') {
      concentracion = calculateConcentration(puntajeDirecto, errores);
    }

    // Preparar datos para insertar
    const resultData = {
      paciente_id: patientId,
      aptitud_id: aptitudeId,
      puntaje_directo: puntajeDirecto,
      tiempo_segundos: timeUsed || 0,
      respuestas: answers,
      errores: errores,
      concentracion: concentracion,
      respuestas_correctas: correctCount || 0,
      respuestas_incorrectas: incorrectCount || 0,
      respuestas_sin_contestar: unansweredCount || 0,
      total_preguntas: totalQuestions || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('resultados')
      .insert([resultData])
      .select()
      .single();

    if (error) throw error;

    console.log('Resultado guardado exitosamente:', data);
    toast.success('Resultado guardado correctamente en la base de datos');
    
    return data;

  } catch (error) {
    console.error('Error al guardar resultado:', error);
    toast.error(`Error al guardar resultado: ${error.message}`);
    throw error;
  }
}