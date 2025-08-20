import React from 'react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { getImagePath } from '../../utils/assetPaths';

const Home = () => {

  return (
    <div>
      <div className="mb-8">
        <Card className="shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02]">
          <CardBody className="p-0">
            <div className="relative w-full h-[350px] overflow-hidden rounded-lg">
              {/* Imagen de fondo con efectos */}
              <div className="absolute inset-0">
                <img
                  src={getImagePath("banner.png")}
                  alt="BAT-7 Evaluación de Aptitudes"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Animated color overlay - moving gradient */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-cyan-500/20 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-l from-indigo-500/20 via-pink-500/20 to-blue-500/30 banner-shimmer"></div>
                </div>

                {/* Pulsing color effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 banner-glow"></div>

                {/* Moving wave effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse"></div>
                </div>

                {/* Subtle floating particles */}
                <div className="absolute inset-0 overflow-hidden opacity-40">
                  <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <div className="absolute top-20 right-20 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
                  <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-pink-300 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-10 right-1/3 w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-300 rounded-full animate-ping"></div>
                </div>
              </div>

              {/* Solo efectos visuales sin texto, ya que la imagen tiene el texto */}
              <div className="relative z-10 flex items-center justify-center h-full">
                {/* Solo indicadores de aptitudes sutiles en las esquinas */}
                <div className="absolute bottom-6 right-6 flex space-x-2 opacity-70">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-300"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-400"></div>
                </div>
              </div>

              {/* Efecto de brillo que se mueve */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mb-8">
        <Card className="shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-[#31375a] to-[#31375a] border-b border-blue-300">
            <h3 className="text-xl font-semibold text-white text-center py-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Descripción
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-gray-700 mb-4 text-center leading-relaxed px-4 py-2">
              A través de esta plataforma digital, podrás realizar la prueba de forma segura y eficiente. El objetivo es obtener
              una visión integral de tus fortalezas y potencial, asegurando un proceso de selección equitativo y orientado a
              identificar a los candidatos mejor preparados para los desafíos y oportunidades que ofrece cada institución.
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="mb-8">
        <Card className="shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-[#31375a] to-[#31375a] border-b border-green-300">
            <h3 className="text-xl font-semibold text-white text-center py-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Aptitudes evaluadas
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Primera fila */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                  <span className="font-semibold">V</span>
                </div>
                <span className="font-medium">Verbal</span>
                <p className="text-sm text-gray-600 mt-1">Comprensión y razonamiento verbal</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                  <span className="font-semibold">E</span>
                </div>
                <span className="font-medium">Espacial</span>
                <p className="text-sm text-gray-600 mt-1">Visualización y orientación espacial</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                  <span className="font-semibold">A</span>
                </div>
                <span className="font-medium">Atención</span>
                <p className="text-sm text-gray-600 mt-1">Capacidad de atención sostenida</p>
              </div>

              {/* Segunda fila */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
                  <span className="font-semibold">R</span>
                </div>
                <span className="font-medium">Razonamiento</span>
                <p className="text-sm text-gray-600 mt-1">Pensamiento lógico y analítico</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
                  <span className="font-semibold">N</span>
                </div>
                <span className="font-medium">Numérica</span>
                <p className="text-sm text-gray-600 mt-1">Habilidades matemáticas y cálculo</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mb-2">
                  <span className="font-semibold">M</span>
                </div>
                <span className="font-medium">Mecánica</span>
                <p className="text-sm text-gray-600 mt-1">Comprensión de principios mecánicos</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mb-2">
                  <span className="font-semibold">O</span>
                </div>
                <span className="font-medium">Ortografía</span>
                <p className="text-sm text-gray-600 mt-1">Corrección ortográfica y lingüística</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Home;




