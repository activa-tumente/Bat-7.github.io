import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { FaQuestionCircle, FaBook, FaPhone, FaEnvelope, FaClock, FaSearch, FaChevronDown, FaChevronUp, FaPlay, FaFileAlt, FaUsers, FaChartBar } from 'react-icons/fa';

// FAQ Data
const faqData = [
  {
    question: "¿Cómo puedo realizar un test BAT-7?",
    answer: "Para realizar un test, sigue estos pasos:",
    steps: [
      "Ve a la sección 'Cuestionario' en el menú lateral",
      "Selecciona el test que deseas realizar",
      "Lee cuidadosamente las instrucciones",
      "Haz clic en 'Comenzar Test'",
      "Responde todas las preguntas dentro del tiempo límite",
      "Revisa tus respuestas y envía el test"
    ]
  },
  {
    question: "¿Cómo interpreto mis resultados?",
    answer: "Los resultados del BAT-7 se presentan en diferentes formatos según el tipo de test. Cada aptitud se evalúa en una escala específica y se compara con grupos normativos. Puedes acceder a informes detallados desde la sección 'Resultados'."
  },
  {
    question: "¿Puedo pausar un test una vez iniciado?",
    answer: "No, una vez que inicias un test BAT-7, no puedes pausarlo. Es importante asegurarte de tener el tiempo completo disponible antes de comenzar. El sistema guarda automáticamente tus respuestas conforme avanzas."
  },
  {
    question: "¿Qué aptitudes evalúa el BAT-7?",
    answer: "El BAT-7 evalúa siete aptitudes principales: Verbal (V), Espacial (E), Atención (A), Razonamiento (R), Numérica (N), Mecánica (M) y Ortografía (O). Cada una tiene su propio test específico con tiempo y formato particulares."
  },
  {
    question: "¿Cómo gestiono los pacientes como psicólogo?",
    answer: "Como psicólogo, puedes gestionar pacientes desde la sección 'Pacientes'. Allí puedes agregar nuevos pacientes, asignar tests, revisar resultados y generar informes. También puedes filtrar y buscar pacientes específicos."
  },
  {
    question: "¿Cómo exporto los resultados?",
    answer: "Puedes exportar resultados individuales o grupales desde la sección 'Resultados'. Usa los botones de exportación para generar informes en PDF con gráficos y análisis detallados."
  },
  {
    question: "¿Qué hago si tengo problemas técnicos?",
    answer: "Si experimentas problemas técnicos, primero verifica tu conexión a internet. Si el problema persiste, contacta al soporte técnico a través del email soporte@bat7.com o llama al +34 900 123 456."
  },
  {
    question: "¿Cómo cambio mi contraseña?",
    answer: "Para cambiar tu contraseña, ve al menú de usuario (esquina superior derecha), selecciona 'Perfil' y luego 'Cambiar Contraseña'. Sigue las instrucciones para establecer una nueva contraseña segura."
  }
];

const Help = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div>
      {/* Header Section with Standardized Style */}
      <PageHeader
        title="Centro de Ayuda BAT-7"
        subtitle="Encuentra respuestas, guías y soporte para el sistema de evaluación de aptitudes"
        icon={FaQuestionCircle}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en la ayuda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <FaPlay className="text-blue-600 text-2xl mr-3" />
              <h3 className="text-lg font-semibold">Primeros Pasos</h3>
            </div>
            <p className="text-gray-600 text-sm">Aprende a usar el sistema BAT-7 desde cero</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <FaFileAlt className="text-green-600 text-2xl mr-3" />
              <h3 className="text-lg font-semibold">Tests y Evaluaciones</h3>
            </div>
            <p className="text-gray-600 text-sm">Guía completa sobre los tests disponibles</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <FaChartBar className="text-purple-600 text-2xl mr-3" />
              <h3 className="text-lg font-semibold">Resultados</h3>
            </div>
            <p className="text-gray-600 text-sm">Cómo interpretar y gestionar resultados</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <FaUsers className="text-orange-600 text-2xl mr-3" />
              <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
            </div>
            <p className="text-gray-600 text-sm">Administración de pacientes y perfiles</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FaBook className="mr-3 text-blue-600" />
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            {faqData.filter(faq =>
              faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                  {expandedFaq === index ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    {faq.steps && (
                      <ol className="mt-3 list-decimal list-inside space-y-1 text-gray-600">
                        {faq.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FaPhone className="mr-3 text-green-600" />
            Contacto y Soporte
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Información de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <FaEnvelope className="text-blue-600 mr-3 text-lg" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-blue-600">soporte@bat7.com</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <FaPhone className="text-green-600 mr-3 text-lg" />
                  <div>
                    <p className="font-medium text-gray-900">Teléfono</p>
                    <p className="text-green-600">+34 900 123 456</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <FaClock className="text-orange-600 mr-3 text-lg" />
                  <div>
                    <p className="font-medium text-gray-900">Horario de Atención</p>
                    <p className="text-orange-600">Lunes a Viernes, 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Soporte Técnico</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 mb-3">
                  Para problemas técnicos urgentes o consultas específicas sobre el sistema BAT-7:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Respuesta en menos de 24 horas</li>
                  <li>• Soporte especializado en evaluaciones</li>
                  <li>• Asistencia para configuración</li>
                  <li>• Resolución de problemas técnicos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Guide Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Guía Rápida de Uso</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-blue-600">Navegación</h3>
              </div>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Usa el menú lateral para navegar</li>
                <li>• Marca favoritos con la estrella</li>
                <li>• Colapsa el menú para más espacio</li>
                <li>• Usa el buscador para encontrar contenido</li>
              </ul>
            </div>

            <div className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-green-600">Evaluaciones</h3>
              </div>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Lee las instrucciones completas</li>
                <li>• Administra tu tiempo correctamente</li>
                <li>• Revisa respuestas antes de enviar</li>
                <li>• Guarda progreso regularmente</li>
              </ul>
            </div>

            <div className="border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-purple-600">Resultados</h3>
              </div>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Accede desde el menú "Resultados"</li>
                <li>• Filtra por fecha o tipo de test</li>
                <li>• Exporta informes en PDF</li>
                <li>• Compara resultados históricos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
